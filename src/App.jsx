import React, { useState, useEffect } from 'react';
import RoutineList from './components/RoutineList';
import WorkTimer from './components/WorkTimer';
import Navigation from './components/Navigation';
import WeekendLog from './components/WeekendLog';
import Reports from './components/Reports';
import { Activity } from 'lucide-react';
import { format, isWeekend as checkIsWeekend } from 'date-fns';

function App() {
  const [completions, setCompletions] = useState({});
  const [actualActivities, setActualActivities] = useState({});
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentTab, setCurrentTab] = useState('home');

  const isWeekend = checkIsWeekend(new Date());

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

  // Save data and update current time
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

    const updateTime = () => {
      setCurrentTimeStr(format(new Date(), 'HH:mm'));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [completions, actualActivities, isWeekend]);

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
