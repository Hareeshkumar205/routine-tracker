import React, { useState, useEffect } from 'react';
import RoutineTable from './components/RoutineTable';
import WorkTimer from './components/WorkTimer';
import { Activity } from 'lucide-react';
import { format } from 'date-fns';

function App() {
  const [completions, setCompletions] = useState({});
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Load today's completions
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const saved = localStorage.getItem(`routine-logs-${today}`);
    if (saved) {
      try {
        setCompletions(JSON.parse(saved));
      } catch (e) {
        setCompletions({});
      }
    }
  }, []);

  // Save completions and update current time
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (Object.keys(completions).length > 0) {
      localStorage.setItem(`routine-logs-${today}`, JSON.stringify(completions));
    }

    const updateTime = () => {
      setCurrentTimeStr(format(new Date(), 'HH:mm'));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [completions]);

  const toggleCompletion = (id) => {
    setCompletions(prev => ({
      ...prev,
      [id]: !prev[id]
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
      
      <main className="main-content">
        <div className="top-section">
          <WorkTimer />
        </div>
        
        <div className="table-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="section-header">
            <h2 className="section-title">Schedule</h2>
            <span className="current-date">{format(new Date(), 'EEEE, MMMM d')}</span>
          </div>
          <RoutineTable 
            completions={completions} 
            toggleCompletion={toggleCompletion} 
            currentTimeStr={currentTimeStr} 
          />
        </div>
      </main>
    </div>
  );
}

export default App;
