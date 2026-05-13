import React, { useState, useEffect, useRef } from 'react';
import RoutineList from './components/RoutineList';
import WorkTimer from './components/WorkTimer';
import Navigation from './components/Navigation';
import WeekendLog from './components/WeekendLog';
import Reports from './components/Reports';
import RoutineEditor from './components/RoutineEditor';
import { Activity, Bell, BellOff } from 'lucide-react';
import { format, isWeekend as checkIsWeekend } from 'date-fns';
import { ROUTINE as DEFAULT_ROUTINE } from './data/routine';

function App() {
  const [completions, setCompletions] = useState({});
  const [actualActivities, setActualActivities] = useState({});
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentTab, setCurrentTab] = useState('home');
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  
  // Custom Routine States
  const [activeRoutineId, setActiveRoutineId] = useState('default');
  const [customRoutine, setCustomRoutine] = useState([]);

  const isWeekend = checkIsWeekend(new Date());
  const notifiedEvents = useRef({});

  // Initialize from LocalStorage
  useEffect(() => {
    const savedActive = localStorage.getItem('active-routine-id');
    const savedCustom = localStorage.getItem('custom-routine');
    if (savedActive) setActiveRoutineId(savedActive);
    if (savedCustom) setCustomRoutine(JSON.parse(savedCustom));
    
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
                  routineData={currentRoutine}
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
        
        {currentTab === 'reports' && <Reports currentRoutine={currentRoutine} />}
        
        {currentTab === 'settings' && (
          <RoutineEditor 
            customRoutine={customRoutine} 
            setCustomRoutine={setCustomRoutine}
            activeRoutineId={activeRoutineId}
            setActiveRoutineId={setActiveRoutineId}
            defaultRoutine={DEFAULT_ROUTINE}
          />
        )}
      </main>

      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default App;
