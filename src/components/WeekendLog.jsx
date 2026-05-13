import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { exportElementToPDF } from '../utils/pdfExport';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const start = i.toString().padStart(2, '0') + ':00';
  const end = ((i + 1) % 24).toString().padStart(2, '0') + ':00';
  return { id: `weekend-${i}`, start, end, label: `${start} - ${end}` };
});

export default function WeekendLog() {
  const [logs, setLogs] = useState({});
  const logRef = useRef(null);

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
    <div className="weekend-container animate-fade-in" style={{ paddingBottom: '90px' }}>
      <div className="weekend-header glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Weekend Freeform Log</h2>
          <p>Log what you actually did each hour.</p>
        </div>
        <button className="icon-button" onClick={() => exportElementToPDF(logRef.current, `Weekend_Log_${format(new Date(), 'yyyy-MM-dd')}.pdf`)} title="Download PDF">
          <Download size={24} color="var(--primary)" />
        </button>
      </div>
      
      <div ref={logRef} className="weekend-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-color)', padding: '16px', borderRadius: '24px' }}>
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
