import React, { useState, useEffect } from 'react';
import { format, subDays, isWeekend as checkIsWeekend } from 'date-fns';
import { ROUTINE } from '../data/routine';

export default function Reports() {
  const [stats, setStats] = useState([]);
  const [todayCompletion, setTodayCompletion] = useState(0);
  const [isTodayWeekend, setIsTodayWeekend] = useState(false);

  useEffect(() => {
    const totalTasks = ROUTINE.length;
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    
    const calculatedStats = last7Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE');
      
      if (checkIsWeekend(date)) {
        const saved = localStorage.getItem(`weekend-logs-${dateStr}`);
        let count = 0;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            count = Object.values(parsed).filter(val => val.trim() !== '').length;
          } catch(e) {}
        }
        return { date: dateStr, dayName, type: 'weekend', loggedHours: count };
      } else {
        const saved = localStorage.getItem(`routine-logs-${dateStr}`);
        let completed = 0;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            completed = Object.values(parsed).filter(val => val === true).length;
          } catch(e) {}
        }
        const percentage = Math.round((completed / totalTasks) * 100);
        return { date: dateStr, dayName, type: 'weekday', percentage };
      }
    });

    setStats(calculatedStats);
    
    const today = new Date();
    setIsTodayWeekend(checkIsWeekend(today));
    
    const todayStat = calculatedStats[calculatedStats.length - 1];
    if (todayStat) {
      if (todayStat.type === 'weekday') {
        setTodayCompletion(todayStat.percentage);
      } else {
        setTodayCompletion(todayStat.loggedHours);
      }
    }
  }, []);

  return (
    <div className="reports-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Analytics</h2>
      </div>

      <div className="glass-panel report-card main-stat">
        <h3>{isTodayWeekend ? "Hours Logged Today" : "Today's Adherence"}</h3>
        
        {isTodayWeekend ? (
          <div className="weekend-stat-display">
            <span className="huge-number">{todayCompletion}</span>
            <span className="stat-label">/ 24 hrs</span>
          </div>
        ) : (
          <div className="circular-progress">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle"
                strokeDasharray={`${todayCompletion}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">{todayCompletion}%</text>
            </svg>
          </div>
        )}
      </div>

      <div className="glass-panel report-card weekly-trends">
        <h3>Last 7 Days</h3>
        <div className="bar-chart">
          {stats.map((stat, i) => (
            <div key={i} className="bar-container">
              <div className="bar-bg">
                {stat.type === 'weekday' ? (
                  <div className="bar-fill" style={{ height: `${stat.percentage}%` }}></div>
                ) : (
                  <div className="bar-fill weekend-fill" style={{ height: `${(stat.loggedHours / 24) * 100}%` }}></div>
                )}
              </div>
              <span className="bar-label">{stat.dayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
