import React, { useState } from 'react';
import { Trash2, Plus, Edit2, Check } from 'lucide-react';

export default function RoutineEditor({ 
  customRoutine, 
  setCustomRoutine, 
  activeRoutineId, 
  setActiveRoutineId,
  defaultRoutine
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleAdd = () => {
    const newId = Date.now().toString();
    const newTask = { id: newId, start: "12:00", end: "13:00", title: "New Task", category: "CUSTOM", mode: "FOCUS" };
    setCustomRoutine([...customRoutine, newTask].sort((a,b) => a.start.localeCompare(b.start)));
    setEditingId(newId);
    setEditForm(newTask);
  };

  const handleDelete = (id) => {
    setCustomRoutine(customRoutine.filter(t => t.id !== id));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditForm(task);
  };

  const saveEdit = () => {
    const updated = customRoutine.map(t => t.id === editingId ? editForm : t);
    setCustomRoutine(updated.sort((a,b) => a.start.localeCompare(b.start)));
    setEditingId(null);
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Schedule Settings</h2>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3>Active Routine</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Choose which schedule you want to track today.</p>
        <div className="timer-tabs" style={{ display: 'flex' }}>
          <button 
            style={{flex: 1}} 
            className={`tab ${activeRoutineId === 'default' ? 'active' : ''}`} 
            onClick={() => setActiveRoutineId('default')}
          >
            Default
          </button>
          <button 
            style={{flex: 1}} 
            className={`tab ${activeRoutineId === 'custom' ? 'active' : ''}`} 
            onClick={() => setActiveRoutineId('custom')}
          >
            My Custom
          </button>
        </div>
      </div>

      {activeRoutineId === 'default' ? (
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>The Default Routine is read-only. Switch to "My Custom" to build your own schedule!</p>
        </div>
      ) : (
        <div className="editor-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>My Custom Schedule</h3>
            <button className="glass-button" style={{ padding: '8px 16px' }} onClick={handleAdd}>
              <Plus size={16} /> Add Task
            </button>
          </div>

          {customRoutine.length === 0 && (
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Your custom schedule is empty.</p>
              <button 
                className="glass-button" 
                style={{ marginTop: '16px', margin: '0 auto' }} 
                onClick={() => setCustomRoutine(defaultRoutine)}
              >
                Copy from Default Routine
              </button>
            </div>
          )}

          {customRoutine.map((task) => (
            <div key={task.id} className="glass-panel" style={{ padding: '16px', marginBottom: '12px' }}>
              {editingId === task.id ? (
                <div className="editor-form">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input type="time" value={editForm.start} onChange={e => setEditForm({...editForm, start: e.target.value})} className="actual-activity-input" style={{ marginTop: 0 }} />
                    <span style={{ alignSelf: 'center' }}>to</span>
                    <input type="time" value={editForm.end} onChange={e => setEditForm({...editForm, end: e.target.value})} className="actual-activity-input" style={{ marginTop: 0 }} />
                  </div>
                  <input type="text" placeholder="Task Title" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="actual-activity-input" style={{ marginTop: 0, marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input type="text" placeholder="Category (e.g. WORK)" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="actual-activity-input" style={{ marginTop: 0, flex: 1 }} />
                    <input type="text" placeholder="Mode (e.g. FOCUS)" value={editForm.mode} onChange={e => setEditForm({...editForm, mode: e.target.value})} className="actual-activity-input" style={{ marginTop: 0, flex: 1 }} />
                  </div>
                  <button className="glass-button" style={{ width: '100%', borderColor: 'var(--success)' }} onClick={saveEdit}>
                    <Check size={18} color="var(--success)" /> Save Task
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>{task.start} - {task.end}</span>
                    <h4 style={{ margin: '4px 0' }}>{task.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.category} • {task.mode}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-button secondary" onClick={() => startEdit(task)}>
                      <Edit2 size={18} />
                    </button>
                    <button className="icon-button secondary" onClick={() => handleDelete(task.id)}>
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
