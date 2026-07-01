import React, { useState } from 'react';
import { storageService } from '../../services/storageService';

const AVATAR_OPTIONS = ['👧', '👦', '🧑‍🎓', '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🧚', '🚀', '🐱', '🐶', '🦄', '🐼', '🦁', '🦊'];
const THEMES = ['purple', 'blue', 'cyan', 'pink', 'amber', 'green'];

export const ProfileSwitcher = ({ activeProfile, onProfileChange, onOpenTrophies, onOpenStats, onOpenParentMode }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKidName, setNewKidName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👧');
  const [selectedTheme, setSelectedTheme] = useState('purple');

  const data = storageService.loadData();
  const allProfiles = data.profiles || [];

  const handleSwitch = (id) => {
    const updated = storageService.setActiveProfile(id);
    onProfileChange(updated);
    setShowDropdown(false);
  };

  const handleAddKid = (e) => {
    e.preventDefault();
    if (!newKidName.trim()) return;
    const added = storageService.addProfile(newKidName.trim(), selectedAvatar, selectedTheme);
    onProfileChange(added);
    setNewKidName('');
    setShowAddModal(false);
    setShowDropdown(false);
  };

  return (
    <header className="glass-card" style={{ padding: '0.85rem 1.5rem', marginBottom: '2rem', position: 'sticky', top: '1rem', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Title & App Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="animate-float" style={{ fontSize: '2rem' }}>🏆</span>
          <div>
            <h1 style={{ fontSize: '1.35rem', margin: 0, background: 'linear-gradient(135deg, #fff, #a0a8c0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Kids Activity Tracker
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Anki-style profiles • Daily rewards • Parent email logs
            </p>
          </div>
        </div>

        {/* Action Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={onOpenTrophies} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <span>⭐ Trophy Room</span>
          </button>
          
          <button onClick={onOpenStats} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <span>📈 Statistics</span>
          </button>

          <button onClick={onOpenParentMode} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' }}>
            <span>🔒 Parent Mode</span>
          </button>

          {/* Profile Switcher Trigger */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="btn btn-primary animate-pulse-glow"
              style={{ padding: '0.5rem 1.2rem', gap: '0.6rem' }}
            >
              <span style={{ fontSize: '1.4rem' }}>{activeProfile?.avatar || '👧'}</span>
              <span style={{ fontWeight: 700 }}>{activeProfile?.name || 'Kid'}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>▼</span>
            </button>

            {/* Profile Dropdown List */}
            {showDropdown && (
              <div className="glass-card" style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: '260px',
                padding: '0.75rem',
                zIndex: 200,
                background: 'var(--bg-secondary)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                border: '1px solid var(--border-highlight)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Switch Profile (Anki style)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {allProfiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitch(p.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        background: p.id === activeProfile?.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                        border: p.id === activeProfile?.id ? '1px solid var(--accent-purple)' : '1px solid transparent',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: p.id === activeProfile?.id ? 700 : 500
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{p.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.95rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.categories?.length || 0} categories</div>
                      </div>
                      {p.id === activeProfile?.id && <span style={{ color: 'var(--accent-purple)' }}>●</span>}
                    </button>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.75rem 0 0.5rem 0', paddingTop: '0.5rem' }}>
                  <button 
                    onClick={() => { setShowDropdown(false); setShowAddModal(true); }}
                    className="btn btn-secondary" 
                    style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', borderStyle: 'dashed' }}
                  >
                    <span>➕ Add New Kid Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add New Kid Profile Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✨</span> Create New Kid Profile
              </h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-icon btn-secondary">✕</button>
            </div>

            <form onSubmit={handleAddKid} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Kid's Name:
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. David, Lily..." 
                  value={newKidName} 
                  onChange={e => setNewKidName(e.target.value)} 
                  required 
                  autoFocus 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Choose an Avatar:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {AVATAR_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedAvatar(icon)}
                      style={{
                        fontSize: '1.75rem',
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: selectedAvatar === icon ? 'rgba(139, 92, 246, 0.3)' : 'var(--bg-primary)',
                        border: selectedAvatar === icon ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Color Theme:
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {THEMES.map(theme => {
                    const colors = { purple: '#8b5cf6', blue: '#3b82f6', cyan: '#06b6d4', pink: '#ec4899', amber: '#f59e0b', green: '#10b981' };
                    return (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => setSelectedTheme(theme)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-full)',
                          background: colors[theme],
                          border: selectedTheme === theme ? '3px solid #fff' : 'none',
                          boxShadow: selectedTheme === theme ? `0 0 15px ${colors[theme]}` : 'none',
                          cursor: 'pointer'
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  🚀 Create Profile & Start!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
