import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

export default function RoutineList({ routineData, completions, actualActivities, taskNotes, toggleCompletion, updateActualActivity, updateTaskNote, currentTimeStr }) {
  const listRef = useRef(null);

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes = timeToMinutes(currentTimeStr || '00:00');

  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.querySelector('.current-card');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTimeStr]);

  if (!routineData || routineData.length === 0) {
    return <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}><p>No tasks found in schedule.</p></div>;
  }

  return (
    <div className="routine-list" ref={listRef}>
      {routineData.map((task, index) => {
        const startMins = timeToMinutes(task.start);
        const endMins = timeToMinutes(task.end);
        const isCurrent = currentMinutes >= startMins && currentMinutes < endMins;
        const isCompleted = completions[task.id];
        const isPast = currentMinutes >= endMins;

        return (
          <div key={task.id} className={`routine-card-container animate-fade-in`} style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}>
            <div className="timeline-indicator">
              <div className={`timeline-dot ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}></div>
              {index !== routineData.length - 1 && (
                <div className="timeline-line"></div>
              )}
            </div>
            
            <div className={`routine-card glass-panel ${isCurrent ? 'current-card' : ''} ${isCompleted ? 'completed-card' : ''}`}>
              <div className="card-header">
                <span className="card-time">{task.start} - {task.end}</span>
                <div className="card-badges">
                  {task.category && <span className="badge category-badge">{task.category}</span>}
                  {task.mode && <span className="badge mode-badge">{task.mode}</span>}
                </div>
              </div>
              
              <div className="card-main-action">
                <div className="checkbox-wrapper" onClick={() => toggleCompletion(task.id)}>
                  {isCompleted ? (
                    <div style={{ background: 'var(--success)', borderRadius: '50%', padding: '4px' }}>
                      <Check size={18} color="#ffffff" />
                    </div>
                  ) : (
                    <div style={{ width: '26px', height: '26px', border: '2px solid var(--glass-border)', borderRadius: '50%' }}></div>
                  )}
                </div>
                <h3 className="card-title" style={{ flexShrink: 0 }}>{task.title}</h3>
                <input 
                  type="text"
                  className="task-inline-input"
                  placeholder="Task notes / details..."
                  value={taskNotes?.[task.id] || ''}
                  onChange={(e) => updateTaskNote(task.id, e.target.value)}
                />
              </div>

              {(task.subtasks && task.subtasks.length > 0) && (
                <div className="subtasks-list">
                  {task.subtasks.map((sub, i) => {
                    const subId = `${task.id}-sub-${i}`;
                    const isSubCompleted = completions[subId];
                    return (
                      <div key={i} className={`subtask-item ${isSubCompleted ? 'checked' : ''}`} onClick={() => toggleCompletion(subId)}>
                        <div className="checkbox-wrapper">
                          {isSubCompleted ? (
                            <div style={{ background: 'var(--success)', borderRadius: '50%', padding: '2px' }}><Check size={12} color="#ffffff" /></div>
                          ) : (
                            <div style={{ width: '16px', height: '16px', border: '2px solid var(--glass-border)', borderRadius: '50%' }}></div>
                          )}
                        </div>
                        <span>{sub}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isCompleted && (
                <input 
                  type="text" 
                  className="actual-activity-input" 
                  placeholder="If different, what did you do?" 
                  value={actualActivities[task.id] || ''}
                  onChange={(e) => updateActualActivity(task.id, e.target.value)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
