import React from 'react';
import { Clock } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

export default function ActivityTimeline({ activities }) {
  if (activities.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <Clock size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '16px' }} />
        <p>No activities logged yet. Start tracking your routine!</p>
      </div>
    );
  }

  const formatDay = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  let currentDay = null;

  return (
    <div className="timeline-container">
      {activities.map((act, index) => {
        const actDate = new Date(act.timestamp);
        const dayString = formatDay(act.timestamp);
        const showDayHeader = dayString !== currentDay;
        if (showDayHeader) {
          currentDay = dayString;
        }

        return (
          <React.Fragment key={act.id}>
            {showDayHeader && (
              <div className="timeline-day-header animate-fade-in">
                <span>{dayString}</span>
              </div>
            )}
            <div className="timeline-item animate-fade-in" style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}>
              <div className="timeline-time">
                <span className="time-text">{format(actDate, 'h:mm a')}</span>
              </div>
              <div className="timeline-dot"></div>
              <div className="timeline-content glass-panel">
                <p className="activity-text">{act.title}</p>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
