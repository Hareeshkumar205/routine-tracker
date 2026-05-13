import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function WorkTimer() {
  const [mode, setMode] = useState('Work'); // 'Work' or 'Break'
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isActive, setIsActive] = useState(false);

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

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
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

  // Calculate progress for circular UI or simple bar
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
        <button className="glass-button icon-button" onClick={toggle}>
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button className="glass-button icon-button secondary" onClick={reset}>
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
