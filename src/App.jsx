import React, { useState, useEffect, useRef } from 'react';
import RoutineList from './components/RoutineList';
import WorkTimer from './components/WorkTimer';
import Navigation from './components/Navigation';
import WeekendLog from './components/WeekendLog';
import Reports from './components/Reports';
import RoutineEditor from './components/RoutineEditor';
import { Activity, Bell, BellOff, Flame, Download } from 'lucide-react';
import { format, isWeekend as checkIsWeekend, subDays } from 'date-fns';
import { ROUTINE as DEFAULT_ROUTINE } from './data/routine';
import { exportElementToPDF } from './utils/pdfExport';

function App() {
  const [completions, setCompletions] = useState({});
  const [actualActivities, setActualActivities] = useState({});
  const [taskNotes, setTaskNotes] = useState({});
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentTab, setCurrentTab] = useState('home');
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  
  // Custom Routine States
  const [activeRoutineId, setActiveRoutineId] = useState('default');
  const [customRoutine, setCustomRoutine] = useState([]);

  // Theme & Gamification
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');
  const [streak, setStreak] = useState(0);

  // PWA Install State
  const checkStandalone = () => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://') ||
      false
    );
  };
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(checkStandalone());

  const isWeekend = checkIsWeekend(new Date());
  const notifiedEvents = useRef({});
  const scheduleRef = useRef(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedActive = localStorage.getItem('active-routine-id');
    const savedCustom = localStorage.getItem('custom-routine');
    const savedActual = localStorage.getItem('routine_actual_activities');
    const savedNotes = localStorage.getItem('routine_task_notes');
    
    if (savedActive) setActiveRoutineId(savedActive);
    if (savedCustom) setCustomRoutine(JSON.parse(savedCustom));
    if (savedActual) setActualActivities(JSON.parse(savedActual));
    if (savedNotes) setTaskNotes(JSON.parse(savedNotes));
    
    if (isWeekend) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const savedCompletions = localStorage.getItem(`routine-logs-${today}`);
    const savedActuals = localStorage.getItem(`routine-actuals-${today}`);
    
    if (savedCompletions) {
      try { setCompletions(JSON.parse(savedCompletions)); } catch (e) {}
    }
    if (savedActuals) {
      try { setActualActivities(JSON.parse(savedActuals)); } catch (e) {}
    }
  }, [isWeekend]);

  // Save Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem('active-routine-id', activeRoutineId);
  }, [activeRoutineId]);

  useEffect(() => {
    if (customRoutine.length > 0 || activeRoutineId === 'custom') {
      localStorage.setItem('custom-routine', JSON.stringify(customRoutine));
    }
  }, [customRoutine, activeRoutineId]);

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // PWA Event Listeners
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e) => {
      setIsStandalone(e.matches || checkStandalone());
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    // Double check on mount
    setIsStandalone(checkStandalone());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', mediaQuery.removeEventListener('change', handleMediaChange));
      }
    };
  }, []);

  const requestNotifications = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission().then(permission => {
        setNotifPermission(permission);
        if (permission === 'granted') {
          new Notification("Notifications Enabled", { body: "You will now receive alerts for your schedule." });
        }
      });
    }
  };

  const currentRoutine = activeRoutineId === 'default' ? DEFAULT_ROUTINE : customRoutine;

  // Streak Calculation
  useEffect(() => {
    let currentStreak = 0;
    const totalTasks = currentRoutine.length || 1;
    
    for (let i = 0; i < 365; i++) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      
      if (checkIsWeekend(d)) {
        const saved = localStorage.getItem(`weekend-logs-${dateStr}`);
        let count = 0;
        if (saved) {
          try {
             const parsed = JSON.parse(saved);
             count = Object.values(parsed).filter(val => val.trim() !== '').length;
          } catch(e) {}
        }
        // Assuming 10 hours is a successful weekend day
        if (count >= 10) currentStreak++;
        else if (i !== 0) break; // Break if missed a past day. If missed today, just don't increment.
      } else {
        const saved = localStorage.getItem(`routine-logs-${dateStr}`);
        let completed = 0;
        if (saved) {
           try {
             const parsed = JSON.parse(saved);
             completed = Object.values(parsed).filter(val => val === true).length;
           } catch(e) {}
        }
        
        // If it's today and we haven't hit 80% yet, don't break the streak, just don't add to it.
        // We only calculate based on the current in-memory completions if it's today.
        if (i === 0 && !checkIsWeekend(new Date())) {
            const todayCompleted = Object.values(completions).filter(val => val === true).length;
            if ((todayCompleted / totalTasks) * 100 >= 80) currentStreak++;
        } else {
            const percentage = Math.round((completed / totalTasks) * 100);
            if (percentage >= 80) currentStreak++;
            else if (i !== 0) break;
        }
      }
    }
    setStreak(currentStreak);
  }, [completions, currentRoutine]);


  // Save data, update time, and fire notifications
  useEffect(() => {
    if (!isWeekend) {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (Object.keys(completions).length > 0) {
        localStorage.setItem(`routine-logs-${today}`, JSON.stringify(completions));
      }
      if (Object.keys(actualActivities).length > 0) {
        localStorage.setItem(`routine-actuals-${today}`, JSON.stringify(actualActivities));
      }
    }

    const updateTimeAndNotify = () => {
      const now = new Date();
      const currentStr = format(now, 'HH:mm');
      const todayKey = format(now, 'yyyy-MM-dd');
      
      setCurrentTimeStr(currentStr);

      // Notification Logic
      if (notifPermission === 'granted' && !isWeekend) {
        if (!notifiedEvents.current[todayKey]) {
          notifiedEvents.current[todayKey] = [];
        }
        
        currentRoutine.forEach(task => {
          const startKey = `start-${task.id}`;
          const endKey = `end-${task.id}`;
          
          if (currentStr === task.start && !notifiedEvents.current[todayKey].includes(startKey)) {
            new Notification("Task Starting", { body: `It's time for: ${task.title}` });
            notifiedEvents.current[todayKey].push(startKey);
          }
          
          if (currentStr === task.end && !notifiedEvents.current[todayKey].includes(endKey)) {
            new Notification("Task Completed", { body: `You finished: ${task.title}` });
            notifiedEvents.current[todayKey].push(endKey);
          }
        });
      }
    };

    updateTimeAndNotify();
    const interval = setInterval(updateTimeAndNotify, 60000);
    return () => clearInterval(interval);
  }, [completions, actualActivities, isWeekend, notifPermission, currentRoutine]);

  const toggleCompletion = (id) => {
    setCompletions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const updateActualActivity = (id, value) => {
    setActualActivities(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="header-title">
          <Activity color="var(--primary)" size={28} />
          <h1>My Routine</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {streak > 0 && (
            <div className="streak-badge">
              <Flame size={18} /> {streak}
            </div>
          )}
          <button 
            className="icon-button notification-toggle" 
            onClick={requestNotifications}
            title={notifPermission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
          >
            {notifPermission === 'granted' ? <Bell size={24} color="var(--primary)" /> : <BellOff size={24} color="var(--text-muted)" />}
          </button>
        </div>
      </header>
      
      <main className="main-content" style={{ paddingBottom: '90px' }}>
        {currentTab === 'home' && (
          isWeekend ? (
            <WeekendLog />
          ) : (
            <>
              <div className="top-section">
                <WorkTimer />
              </div>
              
              <div className="table-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="section-header" style={{ marginBottom: '16px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <h2 className="section-title">Schedule</h2>
                    <span className="current-date" style={{ marginBottom: '2px' }}>{format(new Date(), 'EEEE, MMMM d')}</span>
                  </div>
                  <button className="icon-button" onClick={() => exportElementToPDF(scheduleRef.current, `Schedule_${format(new Date(), 'yyyy-MM-dd')}.pdf`)} title="Download Schedule">
                    <Download size={24} color="var(--primary)" />
                  </button>
                </div>
                <div ref={scheduleRef} style={{ background: 'var(--bg-color)', padding: '16px 8px', borderRadius: '16px' }}>
                  <RoutineList 
                    routineData={currentRoutine}
                    completions={completions} 
                    actualActivities={actualActivities}
                    taskNotes={taskNotes}
                    toggleCompletion={toggleCompletion} 
                    updateActualActivity={updateActualActivity}
                    updateTaskNote={updateTaskNote}
                    currentTimeStr={currentTimeStr} 
                  />
                </div>
              </div>
            </>
          )
        )}
        
        {currentTab === 'reports' && <Reports currentRoutine={currentRoutine} />}
        
        {currentTab === 'settings' && (
          <RoutineEditor 
            customRoutine={customRoutine} 
            setCustomRoutine={setCustomRoutine}
            activeRoutineId={activeRoutineId}
            setActiveRoutineId={setActiveRoutineId}
            defaultRoutine={DEFAULT_ROUTINE}
            theme={theme}
            setTheme={setTheme}
            deferredPrompt={deferredPrompt}
            isStandalone={isStandalone}
          />
        )}
      </main>

      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default App;
