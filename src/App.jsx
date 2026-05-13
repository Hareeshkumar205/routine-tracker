import React, { useState, useEffect, useRef } from 'react';
import RoutineList from './components/RoutineList';
import WorkTimer from './components/WorkTimer';
import Navigation from './components/Navigation';
import WeekendLog from './components/WeekendLog';
import Reports from './components/Reports';
import { Activity, Bell, BellOff } from 'lucide-react';
import { format, isWeekend as checkIsWeekend } from 'date-fns';
import { ROUTINE } from './data/routine';

function App() {
  const [completions, setCompletions] = useState({});
  const [actualActivities, setActualActivities] = useState({});
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentTab, setCurrentTab] = useState('home');
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const isWeekend = checkIsWeekend(new Date());
  const notifiedEvents = useRef({});

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

  // Load today's data
  useEffect(() => {
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
        
        ROUTINE.forEach(task => {
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
  }, [completions, actualActivities, isWeekend, notifPermission]);

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
        <button 
          className="icon-button notification-toggle" 
          onClick={requestNotifications}
          title={notifPermission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
        >
          {notifPermission === 'granted' ? <Bell size={24} color="var(--primary)" /> : <BellOff size={24} color="var(--text-muted)" />}
        </button>
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
                <div className="section-header">
                  <h2 className="section-title">Schedule</h2>
                  <span className="current-date">{format(new Date(), 'EEEE, MMMM d')}</span>
                </div>
                <RoutineList 
                  completions={completions} 
                  actualActivities={actualActivities}
                  toggleCompletion={toggleCompletion} 
                  updateActualActivity={updateActualActivity}
                  currentTimeStr={currentTimeStr} 
                />
              </div>
            </>
          )
        )}
        
        {currentTab === 'reports' && <Reports />}
      </main>

      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default App;
