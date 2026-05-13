import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { ROUTINE } from '../data/routine';

const formatTime = (timeStr) => {
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h, 10));
  d.setMinutes(parseInt(m, 10));
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default function RoutineList({ completions, actualActivities, toggleCompletion, updateActualActivity, currentTimeStr }) {
  
  const isCurrent = (start, end) => {
    if (!currentTimeStr) return false;
    const toMins = (ts) => {
      const [h, m] = ts.split(':').map(Number);
      return h * 60 + m;
    };
    const curr = toMins(currentTimeStr);
    const s = toMins(start);
    const e = toMins(end);
    if (e < s) return curr >= s || curr < e;
    return curr >= s && curr < e;
  };

  return (
    <div className="routine-list">
      {ROUTINE.map((item, index) => {
        const current = isCurrent(item.start, item.end);
        const completed = completions[item.id] || false;
        const actualVal = actualActivities[item.id] || '';
        
        return (
          <div key={item.id} className={`routine-card-container animate-fade-in`} style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}>
            
            <div className="timeline-indicator">
              <div className={`timeline-dot ${current ? 'current' : ''} ${completed ? 'completed' : ''}`}></div>
              {index !== ROUTINE.length - 1 && <div className="timeline-line"></div>}
            </div>
            
            <div className={`routine-card glass-panel ${current ? 'current-card' : ''} ${completed ? 'completed-card' : ''}`}>
              <div className="card-header">
                <span className="card-time">{formatTime(item.start)} - {formatTime(item.end)}</span>
                <div className="card-badges">
                  <span className="badge category-badge">{item.category}</span>
                  <span className="badge mode-badge">{item.mode}</span>
                </div>
              </div>
              
              <div className="card-body">
                <div className="card-main-action">
                  <div className="checkbox-wrapper" onClick={() => toggleCompletion(item.id)}>
                    {completed ? <CheckCircle2 color="var(--primary)" size={28} /> : <Circle color="var(--glass-border)" size={28} />}
                  </div>
                  <h3 className="card-title">{item.title}</h3>
                </div>
                
                <input 
                  type="text" 
                  className="actual-activity-input" 
                  placeholder="If different, what did you do?" 
                  value={actualVal}
                  onChange={(e) => updateActualActivity(item.id, e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
