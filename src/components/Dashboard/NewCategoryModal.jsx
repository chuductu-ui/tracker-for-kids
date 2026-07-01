import React, { useState } from 'react';
import { storageService } from '../../services/storageService';

const ICON_OPTIONS = ['🎨', '🏊‍♂️', '🧩', '💻', '🔬', '🍳', '⚽', '🏀', '🎸', '🥋', '🚀', '🚴', '🎮', '🧘‍♀️', '⭐'];
const UNIT_OPTIONS = ['mins', 'words', 'pages', 'times', 'exercises', 'chapters', 'points'];
const COLOR_OPTIONS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#a855f7'];

export const NewCategoryModal = ({ onClose, onCategoryAdded }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎨');
  const [unit, setUnit] = useState('mins');
  const [customUnit, setCustomUnit] = useState('');
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalUnit = unit === 'custom' ? (customUnit.trim() || 'units') : unit;

    // Generate fun default tiered thresholds based on unit
    const multiplier = finalUnit === 'mins' ? 60 : (finalUnit === 'words' || finalUnit === 'pages' ? 25 : 10);
    const thresholds = [
      { name: 'Bronze Medal 🥉', value: multiplier * 1, icon: '🥉' },
      { name: 'Silver Star 🥈', value: multiplier * 3, icon: '🥈' },
      { name: 'Gold Trophy 🏆', value: multiplier * 6, icon: '🏆' },
      { name: 'Diamond Crown 💎', value: multiplier * 10, icon: '💎' },
    ];

    const added = storageService.addCategory(name.trim(), selectedIcon, finalUnit, selectedColor, thresholds);
    onCategoryAdded(added);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✨</span> Create New Tracking Category!
          </h3>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              What do you want to track? (Name):
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Drawing, Swimming, Coding..." 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              autoFocus 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Pick a Fun Icon:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', padding: '0.25rem' }}>
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  style={{
                    fontSize: '1.5rem',
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: selectedIcon === icon ? 'rgba(139, 92, 246, 0.3)' : 'var(--bg-primary)',
                    border: selectedIcon === icon ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
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
              Measurement Unit (How is it counted?):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {UNIT_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setUnit(opt)}
                  className={`btn ${unit === opt ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', minHeight: '36px' }}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUnit('custom')}
                className={`btn ${unit === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', minHeight: '36px' }}
              >
                Custom...
              </button>
            </div>
            {unit === 'custom' && (
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter custom unit (e.g. songs, projects)" 
                value={customUnit} 
                onChange={e => setCustomUnit(e.target.value)} 
                style={{ marginTop: '0.75rem' }}
                required 
              />
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Theme Color:
            </label>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map(col => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-full)',
                    background: col,
                    border: selectedColor === col ? '3px solid #fff' : 'none',
                    boxShadow: selectedColor === col ? `0 0 15px ${col}` : 'none',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 Notice: 4 exciting trophy milestones (Bronze 🥉, Silver Star 🥈, Gold Trophy 🏆, Diamond Crown 💎) will be generated automatically for this category!
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              🎉 Create & Add to Dashboard!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
