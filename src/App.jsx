import React, { useState, useEffect } from 'react';
import ActivityTimeline from './components/ActivityTimeline';
import LogActivity from './components/LogActivity';
import { Activity } from 'lucide-react';

function App() {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('routine-activities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('routine-activities', JSON.stringify(activities));
  }, [activities]);

  const handleAddActivity = (title) => {
    const newActivity = {
      id: crypto.randomUUID(),
      title,
      timestamp: new Date().toISOString()
    };
    setActivities([newActivity, ...activities]);
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="header-title">
          <Activity color="var(--primary)" size={28} />
          <h1>Routine</h1>
        </div>
      </header>
      
      <main className="main-content">
        <LogActivity onAddActivity={handleAddActivity} />
        <div className="timeline-section">
          <h2 className="section-title">Log</h2>
          <ActivityTimeline activities={activities} />
        </div>
      </main>
    </div>
  );
}

export default App;
