import React, { useState, useEffect, useMemo } from 'react';
import { format, subDays, addDays, isWeekend as checkIsWeekend, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Reports({ currentRoutine }) {
  const [viewMode, setViewMode] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const totalTasks = currentRoutine.length || 1;

  const getDayStat = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'EEE');
    const dayNum = format(date, 'dd');
    const isWeekend = checkIsWeekend(date);

    if (isWeekend) {
      const saved = localStorage.getItem(`weekend-logs-${dateStr}`);
      let count = 0;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          count = Object.values(parsed).filter(val => val.trim() !== '').length;
        } catch(e) {}
      }
      return { date: dateStr, dayName, dayNum, type: 'weekend', loggedHours: count, percentage: Math.round((count / 24) * 100) };
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
      return { date: dateStr, dayName, dayNum, type: 'weekday', percentage };
    }
  };

  const dailyStat = useMemo(() => getDayStat(selectedDate), [selectedDate]);
  
  const weeklyStats = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => getDayStat(subDays(new Date(), i))).reverse();
  }, []);

  const monthlyStats = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => getDayStat(subDays(new Date(), i))).reverse();
  }, []);

  const weeklyAvg = useMemo(() => {
    const sum = weeklyStats.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.round(sum / 7);
  }, [weeklyStats]);

  const monthlyAvg = useMemo(() => {
    const sum = monthlyStats.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.round(sum / 30);
  }, [monthlyStats]);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => {
    if (!isToday(selectedDate)) {
      setSelectedDate(prev => addDays(prev, 1));
    }
  };

  return (
    <div className="reports-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2 className="section-title">Analytics</h2>
      </div>

      <div className="timer-tabs glass-panel" style={{ marginBottom: '24px', alignSelf: 'center', width: '100%', maxWidth: '400px', display: 'flex' }}>
        <button style={{flex: 1}} className={`tab ${viewMode === 'daily' ? 'active' : ''}`} onClick={() => setViewMode('daily')}>Daily</button>
        <button style={{flex: 1}} className={`tab ${viewMode === 'weekly' ? 'active' : ''}`} onClick={() => setViewMode('weekly')}>Weekly</button>
        <button style={{flex: 1}} className={`tab ${viewMode === 'monthly' ? 'active' : ''}`} onClick={() => setViewMode('monthly')}>Monthly</button>
      </div>

      {viewMode === 'daily' && (
        <div className="glass-panel report-card animate-fade-in">
          <div className="date-navigator">
            <button className="icon-button secondary" onClick={handlePrevDay}>
              <ChevronLeft size={20} />
            </button>
            <h3 style={{ margin: 0 }}>{isToday(selectedDate) ? "Today" : format(selectedDate, 'MMMM d, yyyy')}</h3>
            <button className="icon-button secondary" onClick={handleNextDay} disabled={isToday(selectedDate)} style={{ opacity: isToday(selectedDate) ? 0.3 : 1 }}>
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div style={{ marginTop: '32px' }}>
            {dailyStat.type === 'weekend' ? (
              <div className="weekend-stat-display">
                <span className="huge-number">{dailyStat.loggedHours}</span>
                <span className="stat-label">/ 24 Hours Logged</span>
              </div>
            ) : (
              <div className="circular-progress">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${dailyStat.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <text x="18" y="20.35" className="percentage">{dailyStat.percentage}%</text>
                </svg>
              </div>
            )}
            <p style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
              {dailyStat.type === 'weekend' ? 'Weekend Freeform' : 'Routine Adherence'}
            </p>
          </div>
        </div>
      )}

      {viewMode === 'weekly' && (
        <>
          <div className="glass-panel report-card main-stat animate-fade-in">
            <h3>7-Day Average</h3>
            <div className="weekend-stat-display" style={{ height: '100px' }}>
              <span className="huge-number" style={{ color: 'var(--primary)', textShadow: '0 0 20px var(--primary-glow)' }}>{weeklyAvg}%</span>
            </div>
          </div>

          <div className="glass-panel report-card weekly-trends animate-fade-in">
            <h3>Last 7 Days</h3>
            <div className="bar-chart">
              {weeklyStats.map((stat, i) => (
                <div key={i} className="bar-container">
                  <div className="bar-bg">
                    <div className={`bar-fill ${stat.type === 'weekend' ? 'weekend-fill' : ''}`} style={{ height: `${stat.percentage}%` }}></div>
                  </div>
                  <span className="bar-label">{stat.dayName}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === 'monthly' && (
        <>
          <div className="glass-panel report-card main-stat animate-fade-in">
            <h3>30-Day Average</h3>
            <div className="weekend-stat-display" style={{ height: '100px' }}>
              <span className="huge-number" style={{ color: '#bb86fc', textShadow: '0 0 20px rgba(187, 134, 252, 0.5)' }}>{monthlyAvg}%</span>
            </div>
          </div>

          <div className="glass-panel report-card weekly-trends animate-fade-in">
            <h3>Last 30 Days</h3>
            <div className="bar-chart scrollable-chart">
              {monthlyStats.map((stat, i) => (
                <div key={i} className="bar-container mini-bar">
                  <div className="bar-bg">
                    <div className={`bar-fill ${stat.type === 'weekend' ? 'weekend-fill' : ''}`} style={{ height: `${stat.percentage}%` }}></div>
                  </div>
                  <span className="bar-label">{stat.dayNum}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
