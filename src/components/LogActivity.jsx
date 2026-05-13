import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function LogActivity({ onAddActivity }) {
  const [activity, setActivity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activity.trim()) return;
    onAddActivity(activity);
    setActivity('');
  };

  return (
    <div className="log-activity-container glass-panel animate-fade-in">
      <form onSubmit={handleSubmit} className="log-activity-form">
        <input 
          type="text" 
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="What are you doing right now?" 
          className="glass-input"
          autoFocus
        />
        <button type="submit" className="glass-button icon-button" aria-label="Log activity">
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
}
