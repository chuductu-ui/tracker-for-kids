import React from 'react';
import { storageService } from '../../services/storageService';

export const TrophyRoomModal = ({ onClose }) => {
  const statsData = storageService.getStats();
  const { profile, categoriesStats } = statsData;

  if (!profile) return null;

  // Calculate total trophies available vs earned
  let totalAvailable = 0;
  let totalEarned = profile.earnedTrophies?.length || 0;

  categoriesStats.forEach(cat => {
    totalAvailable += (cat.thresholds?.length || 0);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '820px', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="animate-float" style={{ fontSize: '2.5rem' }}>🏆</span>
            <div>
              <h2 style={{ fontSize: '1.75rem', margin: 0, background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {profile.name}'s Trophy Room
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Every time you practice, you get closer to unlocking shiny medals and trophies!
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>

        {/* Overall Achievement Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              🌟 Trophies Unlocked
            </div>
            <div className="font-fun" style={{ fontSize: '2.5rem', color: '#f59e0b' }}>
              {totalEarned} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ {totalAvailable}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              🔥 Current Streak
            </div>
            <div className="font-fun" style={{ fontSize: '2.5rem', color: '#10b981' }}>
              {statsData.streak} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Days!</span>
            </div>
          </div>
        </div>

        {/* Categories Trophies Showcase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {categoriesStats.map(cat => {
            const sortedThresholds = [...(cat.thresholds || [])].sort((a, b) => a.value - b.value);

            return (
              <div key={cat.id} className="glass-panel" style={{ background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, color: cat.color || '#8b5cf6' }}>{cat.name} Awards</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    Total: <strong>{cat.totalAllTime} {cat.unit}</strong>
                  </span>
                </div>

                {/* Trophies Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                  {sortedThresholds.map((th, idx) => {
                    const isUnlocked = cat.totalAllTime >= th.value;
                    const earnedRecord = profile.earnedTrophies?.find(
                      t => t.categoryId === cat.id && t.thresholdName === th.name
                    );

                    return (
                      <div
                        key={idx}
                        style={{
                          background: isUnlocked ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.1))' : 'rgba(255, 255, 255, 0.02)',
                          border: isUnlocked ? '2px solid #f59e0b' : '1px dashed var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          textAlign: 'center',
                          position: 'relative',
                          boxShadow: isUnlocked ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{ 
                          fontSize: '3rem', 
                          marginBottom: '0.5rem', 
                          filter: isUnlocked ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' : 'grayscale(100%) opacity(0.3)',
                          transform: isUnlocked ? 'scale(1.1)' : 'scale(0.9)'
                        }}>
                          {th.icon || '🏆'}
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isUnlocked ? '#fff' : 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          {th.name}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: isUnlocked ? '#f59e0b' : 'var(--text-secondary)', fontWeight: 600 }}>
                          Goal: {th.value} {cat.unit}
                        </div>

                        {isUnlocked ? (
                          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>
                            ✅ Unlocked {earnedRecord?.date || ''}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            🔒 Need {Math.max(0, th.value - cat.totalAllTime)} more!
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', maxWidth: '280px' }}>
            🎉 Keep Practicing!
          </button>
        </div>

      </div>
    </div>
  );
};
