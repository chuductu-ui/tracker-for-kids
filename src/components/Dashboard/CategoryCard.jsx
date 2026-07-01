import React from 'react';

export const CategoryCard = ({ stat, onRecord, onDelete }) => {
  const { id, name, icon, unit, color, totalAllTime, totalToday, nextThreshold, thresholds = [], progressPercent } = stat;

  // Sort thresholds by value ascending
  const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.25rem',
        borderTop: `4px solid ${color || '#8b5cf6'}`,
        position: 'relative'
      }}
    >
      {/* Top Header: Icon, Name & Today's Progress Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            fontSize: '2.2rem',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: `color-mix(in srgb, ${color || '#8b5cf6'} 20%, transparent)`,
            border: `1px solid ${color || '#8b5cf6'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 15px color-mix(in srgb, ${color || '#8b5cf6'} 30%, transparent)`
          }}>
            {icon || '⭐'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{name}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Tracked in {unit}
            </span>
          </div>
        </div>

        {/* Today Pill */}
        <div style={{
          background: totalToday > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.08)',
          color: totalToday > 0 ? '#fff' : 'var(--text-secondary)',
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          boxShadow: totalToday > 0 ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
        }}>
          <span>📅 Today:</span>
          <span className="font-fun" style={{ fontSize: '1rem' }}>{totalToday} {unit}</span>
        </div>
      </div>

      {/* Aggregated All-Time Score Display */}
      <div style={{ 
        background: 'rgba(0,0,0,0.2)', 
        padding: '1rem 1.25rem', 
        borderRadius: 'var(--radius-md)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ minWidth: '120px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            🏆 All-Time Aggregated Total
          </div>
          <div className="font-fun" style={{ fontSize: '2rem', color: color || '#8b5cf6', lineHeight: 1.2 }}>
            {totalAllTime} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{unit}</span>
          </div>
        </div>
 
        {/* Next Goal Badge */}
        {nextThreshold && (
          <div style={{ textAlign: 'right', minWidth: '120px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next Milestone Goal:</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>
              {nextThreshold.name} ({nextThreshold.value} {unit})
            </div>
          </div>
        )}
      </div>
 
      {/* Multi-Threshold Milestone Timeline Track */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600 }}>
          <span>Milestone Progress</span>
          <span>{progressPercent}% to next trophy!</span>
        </div>
 
        {/* Main Progress Bar */}
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${color || '#8b5cf6'}, #ec4899)`
            }} 
          />
        </div>
 
        {/* Milestones Horizontal Badges Track */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', gap: '0.3rem' }}>
          {sortedThresholds.map((th, idx) => {
            const isUnlocked = totalAllTime >= th.value;
            return (
              <div 
                key={idx}
                title={`${th.name} - Unlock at ${th.value} ${unit}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.4rem 0.15rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isUnlocked ? '1px solid #10b981' : '1px solid var(--border-color)',
                  opacity: isUnlocked ? 1 : 0.6,
                  transition: 'all 0.2s',
                  position: 'relative',
                  minWidth: 0,
                  overflow: 'hidden'
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>{th.icon || '🏆'}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isUnlocked ? '#10b981' : 'var(--text-muted)', lineHeight: 1.1 }}>
                  {th.value}
                </div>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.8, textTransform: 'lowercase', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {unit}
                </div>
                {isUnlocked && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#10b981', color: '#fff', fontSize: '0.6rem', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Activity Action Button */}
      <button 
        onClick={() => onRecord(stat)} 
        className="btn btn-primary" 
        style={{ 
          width: '100%', 
          marginTop: '0.5rem', 
          background: `linear-gradient(135deg, ${color || '#8b5cf6'}, #3b82f6)`,
          fontSize: '1.05rem',
          padding: '0.85rem'
        }}
      >
        <span>➕ Record Today's Activity!</span>
      </button>
    </div>
  );
};
