import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const start = i.toString().padStart(2, '0') + ':00';
  const end = ((i + 1) % 24).toString().padStart(2, '0') + ':00';
  return { id: `weekend-${i}`, start, end, label: `${start} - ${end}` };
});

export default function WeekendLog() {
  const [logs, setLogs] = useState({});

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const saved = localStorage.getItem(`weekend-logs-${today}`);
    if (saved) {
      try { setLogs(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  const handleChange = (id, value) => {
    const newLogs = { ...logs, [id]: value };
    setLogs(newLogs);
    const today = format(new Date(), 'yyyy-MM-dd');
    localStorage.setItem(`weekend-logs-${today}`, JSON.stringify(newLogs));
  };

  return (
    <div className="weekend-log animate-fade-in">
      <div className="weekend-header glass-panel">
        <h2>Weekend Mode</h2>
        <p>Your strict schedule is paused. Log your activities hourly below.</p>
      </div>
      
      <div className="routine-list">
        {HOURS.map((hour, idx) => (
          <div key={hour.id} className="routine-card-container animate-fade-in" style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}>
            <div className="timeline-indicator">
              <div className="timeline-dot"></div>
              {idx !== HOURS.length - 1 && <div className="timeline-line"></div>}
            </div>
            
            <div className="routine-card glass-panel" style={{ padding: '16px' }}>
              <div className="card-header" style={{ marginBottom: '8px' }}>
                <span className="card-time" style={{ color: 'var(--text-main)' }}>{hour.label}</span>
              </div>
              <div className="card-body">
                <input 
                  type="text" 
                  className="actual-activity-input" 
                  style={{ marginTop: 0 }}
                  placeholder="What did you do during this hour?" 
                  value={logs[hour.id] || ''}
                  onChange={(e) => handleChange(hour.id, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
