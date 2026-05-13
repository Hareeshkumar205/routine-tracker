import React, { useState, useRef } from 'react';
import { Trash2, Plus, Edit2, Check, Download, Upload, MonitorSmartphone, X } from 'lucide-react';

export default function RoutineEditor({ 
  customRoutine, 
  setCustomRoutine, 
  activeRoutineId, 
  setActiveRoutineId,
  defaultRoutine,
  theme,
  setTheme,
  deferredPrompt,
  isStandalone
}) {
  const [showIOSModal, setShowIOSModal] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ subtasks: [] });
  const fileInputRef = useRef(null);

  const handleAdd = () => {
    const newId = Date.now().toString();
    const newTask = { id: newId, start: "12:00", end: "13:00", title: "New Task", category: "CUSTOM", mode: "FOCUS", subtasks: [] };
    setCustomRoutine([...customRoutine, newTask].sort((a,b) => a.start.localeCompare(b.start)));
    setEditingId(newId);
    setEditForm(newTask);
  };

  const handleDelete = (id) => {
    setCustomRoutine(customRoutine.filter(t => t.id !== id));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditForm({ ...task, subtasks: task.subtasks || [] });
  };

  const saveEdit = () => {
    const updated = customRoutine.map(t => t.id === editingId ? editForm : t);
    setCustomRoutine(updated.sort((a,b) => a.start.localeCompare(b.start)));
    setEditingId(null);
  };

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
      });
    } else {
      alert("Installation is not supported on this browser, or it's already installed.");
    }
  };

  const exportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('routine') || key.includes('app-theme') || key.includes('weekend')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `routine_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
        alert("Backup restored successfully!");
        window.location.reload();
      } catch (err) {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Settings</h2>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3>Appearance</h3>
        <div className="timer-tabs" style={{ display: 'flex', marginTop: '16px' }}>
          <button style={{flex: 1}} className={`tab ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>Light Mode</button>
          <button style={{flex: 1}} className={`tab ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>Dark Mode</button>
        </div>
      </div>

      {!isStandalone && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'var(--primary-glow)', borderColor: 'var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MonitorSmartphone size={20} /> Install App
              </h3>
              <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', marginTop: '4px' }}>Add this tracker to your home screen.</p>
            </div>
            <button className="glass-button" style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none' }} onClick={handleInstallClick}>
              Install
            </button>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3>Data Backup</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Export your routine and analytics to save them, or import a backup to restore.</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="glass-button" style={{ flex: 1, padding: '8px' }} onClick={exportData}>
            <Download size={18} /> Export
          </button>
          <button className="glass-button" style={{ flex: 1, padding: '8px' }} onClick={() => fileInputRef.current.click()}>
            <Upload size={18} /> Import
          </button>
          <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={importData} />
        </div>
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
                onClick={() => setCustomRoutine(defaultRoutine.map(t => ({...t, subtasks: t.subtasks || []})))}
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
                  
                  {/* Subtasks Editor */}
                  <div style={{ marginBottom: '16px', background: 'var(--timer-bg)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sub-Tasks Checklist</label>
                      <button className="icon-button secondary" onClick={() => setEditForm({...editForm, subtasks: [...(editForm.subtasks || []), "New Subtask"]})} style={{ padding: '4px' }}><Plus size={16} color="var(--primary)"/></button>
                    </div>
                    {(editForm.subtasks || []).map((sub, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <input type="text" value={sub} onChange={e => {
                          const newSubs = [...editForm.subtasks];
                          newSubs[i] = e.target.value;
                          setEditForm({...editForm, subtasks: newSubs});
                        }} className="actual-activity-input" style={{ marginTop: 0, padding: '8px' }} />
                        <button className="icon-button secondary" onClick={() => {
                          const newSubs = editForm.subtasks.filter((_, idx) => idx !== i);
                          setEditForm({...editForm, subtasks: newSubs});
                        }} style={{ padding: '8px' }}><Trash2 size={16} color="#ef4444" /></button>
                      </div>
                    ))}
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
                    {(task.subtasks && task.subtasks.length > 0) && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {task.subtasks.length} sub-tasks
                      </div>
                    )}
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

      {showIOSModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '32px 24px', background: 'var(--bg-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>Install on iPhone</h2>
              <button className="icon-button" onClick={() => setShowIOSModal(false)}><X size={24} /></button>
            </div>
            <p style={{ marginBottom: '16px', lineHeight: 1.5 }}>Apple does not support automated installs. To add this app to your Home Screen:</p>
            <ol style={{ paddingLeft: '24px', lineHeight: 1.8, marginBottom: '24px' }}>
              <li>Tap the <strong>Share</strong> icon at the bottom of Safari (the square with an arrow pointing up).</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top right corner.</li>
            </ol>
            <button className="glass-button" style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 'none' }} onClick={() => setShowIOSModal(false)}>Got it!</button>
          </div>
        </div>
      )}

    </div>
  );
}
