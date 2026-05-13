import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Headphones } from 'lucide-react';

export default function WorkTimer() {
  const [mode, setMode] = useState('Work'); // 'Work' or 'Break'
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);

  const createBrownNoise = (audioCtx) => {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; 
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    return noiseSource;
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      const newMode = mode === 'Work' ? 'Break' : 'Work';
      setMode(newMode);
      setTimeLeft(newMode === 'Work' ? 50 * 60 : 10 * 60);
      setIsActive(false);
      
      if (Notification.permission === 'granted') {
        new Notification(`Time for your ${newMode === 'Work' ? '50-minute work session' : '10-minute break'}!`);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  useEffect(() => {
    if (isActive && isAudioEnabled) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!noiseNodeRef.current) {
        noiseNodeRef.current = createBrownNoise(audioCtxRef.current);
        const filter = audioCtxRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.value = 0.5;
        
        noiseNodeRef.current.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);
        noiseNodeRef.current.start();
      }
    } else {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
    }
  }, [isActive, isAudioEnabled]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'Work' ? 50 * 60 : 10 * 60);
  };
  
  const setSession = (type) => {
    setMode(type);
    setIsActive(false);
    setTimeLeft(type === 'Work' ? 50 * 60 : 10 * 60);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const totalTime = mode === 'Work' ? 50 * 60 : 10 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="work-timer glass-panel">
      <div className="timer-header">
        <h3>50/10 Cycle</h3>
        <div className="timer-tabs">
          <button className={`tab ${mode === 'Work' ? 'active' : ''}`} onClick={() => setSession('Work')}>Work</button>
          <button className={`tab ${mode === 'Break' ? 'active' : ''}`} onClick={() => setSession('Break')}>Break</button>
        </div>
      </div>
      <div className="timer-display-container">
        <div className="timer-progress-bg">
          <div className="timer-progress-fill" style={{ width: `${progress}%`, backgroundColor: mode === 'Work' ? 'var(--primary)' : '#10b981' }}></div>
        </div>
        <div className="timer-display" style={{ color: mode === 'Work' ? 'var(--primary)' : '#10b981' }}>
          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="timer-controls">
        <button 
          className="icon-button" 
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          style={{ borderColor: isAudioEnabled ? 'var(--primary)' : 'var(--glass-border)', color: isAudioEnabled ? 'var(--primary)' : 'var(--text-main)' }}
          title="Ambient Focus Audio"
        >
          <Headphones size={24} />
        </button>
        <button className="icon-button" onClick={toggleTimer}>
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button className="icon-button" onClick={resetTimer}>
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}
