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

export default function RoutineTable({ completions, actualActivities, toggleCompletion, updateActualActivity, currentTimeStr }) {
  
  // To highlight the current row
  const isCurrent = (start, end) => {
    if (!currentTimeStr) return false;
    
    // Convert to minutes from midnight
    const toMins = (ts) => {
      const [h, m] = ts.split(':').map(Number);
      return h * 60 + m;
    };
    
    const curr = toMins(currentTimeStr);
    const s = toMins(start);
    const e = toMins(end);
    
    if (e < s) {
      return curr >= s || curr < e;
    }
    return curr >= s && curr < e;
  };

  return (
    <div className="routine-table-wrapper glass-panel">
      <table className="routine-table">
        <thead>
          <tr>
            <th className="cell-checkbox"></th>
            <th>Time Slot</th>
            <th>Activity</th>
            <th className="hidden-mobile">Category</th>
            <th className="hidden-mobile">Mode</th>
          </tr>
        </thead>
        <tbody>
          {ROUTINE.map((item) => {
            const current = isCurrent(item.start, item.end);
            const completed = completions[item.id] || false;
            const actualVal = actualActivities[item.id] || '';
            
            return (
              <tr key={item.id} className={`${current ? 'current-row' : ''} ${completed ? 'completed-row' : ''}`}>
                <td className="cell-checkbox" onClick={() => toggleCompletion(item.id)}>
                  {completed ? <CheckCircle2 color="var(--primary)" size={20} /> : <Circle color="var(--glass-border)" size={20} />}
                </td>
                <td className="cell-time">{formatTime(item.start)} - {formatTime(item.end)}</td>
                <td className="cell-activity">
                  <div className="activity-title">{item.title}</div>
                  <input 
                    type="text" 
                    className="actual-activity-input" 
                    placeholder="If different, what did you do?" 
                    value={actualVal}
                    onChange={(e) => updateActualActivity(item.id, e.target.value)}
                  />
                </td>
                <td className="cell-category hidden-mobile"><span className="badge category-badge">{item.category}</span></td>
                <td className="cell-mode hidden-mobile"><span className="badge mode-badge">{item.mode}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
