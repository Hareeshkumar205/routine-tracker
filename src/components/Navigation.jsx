import React from 'react';
import { Home, BarChart2, Settings } from 'lucide-react';

export default function Navigation({ currentTab, setCurrentTab }) {
  return (
    <div className="bottom-nav glass-panel">
      <button 
        className={`nav-item ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => setCurrentTab('home')}
      >
        <Home size={24} />
        <span>Today</span>
      </button>
      <button 
        className={`nav-item ${currentTab === 'reports' ? 'active' : ''}`}
        onClick={() => setCurrentTab('reports')}
      >
        <BarChart2 size={24} />
        <span>Reports</span>
      </button>
      <button 
        className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
        onClick={() => setCurrentTab('settings')}
      >
        <Settings size={24} />
        <span>Settings</span>
      </button>
    </div>
  );
}
