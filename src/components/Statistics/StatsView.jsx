import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import questionsData from '../../data/questionsData.json';

const getQuestionDetails = (questionId, fileKey) => {
  const file = questionsData[fileKey];
  if (!file) return null;
  const q = file.questions.find(item => item.id === questionId);
  return q ? { ...q, fileTitle: file.title } : null;
};

export const StatsView = ({ onClose, onRefresh }) => {
  const [timeRange, setTimeRange] = useState(7); // 7, 14, 30, 999 (All Time)
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [hoveredDay, setHoveredDay] = useState(null);

  const statsData = storageService.getStats();
  const { profile, categoriesStats, logs } = statsData;

  if (!profile) return null;

  // Filter logs by selected category
  const filteredLogs = selectedCatId === 'all' 
    ? logs 
    : logs.filter(l => l.categoryId === selectedCatId);

  // Generate date series for Bar & Line graphs
  const daysCount = timeRange === 999 ? 30 : timeRange;
  const dateSeries = [];
  const today = new Date();
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    
    // Find logs for this day
    const dayLogs = filteredLogs.filter(l => l.date === dateStr);
    const dayTotal = dayLogs.reduce((sum, l) => sum + l.amount, 0);

    dateSeries.push({
      date: dateStr,
      label: dayLabel,
      total: dayTotal,
      logs: dayLogs
    });
  }

  // Calculate max for graph scaling
  const maxBarVal = Math.max(...dateSeries.map(d => d.total), 10);

  // Calculate cumulative trend series
  let runningTotal = 0;
  const cumulativeSeries = dateSeries.map(d => {
    runningTotal += d.total;
    return { ...d, cumulative: runningTotal };
  });
  const maxCumulativeVal = Math.max(runningTotal, 10);

  // Delete log handler
  const handleDeleteLog = (logId) => {
    if (window.confirm("Are you sure you want to delete this recorded activity?")) {
      storageService.deleteLog(logId);
      onRefresh();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '860px', maxHeight: '92vh' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span>📊</span> Historic Performance & Statistics
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Viewing performance graph for <strong>{profile.name}</strong> • Watch your progress climb! 🚀
            </p>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>

        {/* Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category:</span>
            <button
              onClick={() => setSelectedCatId('all')}
              className={`btn ${selectedCatId === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minHeight: '32px' }}
            >
              ⭐ All Combined
            </button>
            {categoriesStats.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`btn ${selectedCatId === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  minHeight: '32px',
                  background: selectedCatId === cat.id ? cat.color : undefined 
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Time Range Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {[
              { label: '7 Days', val: 7 },
              { label: '14 Days', val: 14 },
              { label: '30 Days', val: 30 },
              { label: 'All Time', val: 999 }
            ].map(t => (
              <button
                key={t.val}
                onClick={() => setTimeRange(t.val)}
                className={`btn ${timeRange === t.val ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', minHeight: '32px' }}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>

        {/* Section 1: Daily Activity Bar Chart (Interactive SVG) */}
        <div className="glass-panel" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>📈 Daily Activity Breakdown</h3>
            {hoveredDay ? (
              <div style={{ fontSize: '0.85rem', background: 'rgba(139, 92, 246, 0.2)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', color: '#8b5cf6', fontWeight: 600 }}>
                {hoveredDay.label}: <strong className="font-fun">{hoveredDay.total}</strong> {selectedCatId === 'all' ? 'total units' : categoriesStats.find(c=>c.id===selectedCatId)?.unit}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hover over a bar to see details</div>
            )}
          </div>

          {/* SVG Bar Chart Container */}
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '6px', paddingTop: '1rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
            {dateSeries.map((day, idx) => {
              const heightPct = Math.max(4, Math.round((day.total / maxBarVal) * 100));
              const isToday = idx === dateSeries.length - 1;
              const catObj = categoriesStats.find(c => c.id === selectedCatId);
              const barColor = selectedCatId === 'all' ? '#8b5cf6' : (catObj?.color || '#3b82f6');

              return (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    cursor: 'pointer',
                    group: true
                  }}
                >
                  {/* Bar Value Label on Hover or if high enough */}
                  {(hoveredDay?.date === day.date || day.total > 0) && (
                    <span className="font-fun" style={{ 
                      fontSize: '0.75rem', 
                      marginBottom: '4px', 
                      color: hoveredDay?.date === day.date ? '#fff' : 'var(--text-muted)',
                      fontWeight: hoveredDay?.date === day.date ? 700 : 400
                    }}>
                      {day.total > 0 ? day.total : ''}
                    </span>
                  )}

                  {/* The Bar */}
                  <div style={{
                    width: '100%',
                    maxWidth: '28px',
                    height: `${heightPct}%`,
                    background: hoveredDay?.date === day.date 
                      ? `linear-gradient(180deg, #ec4899, ${barColor})` 
                      : (day.total > 0 ? `linear-gradient(180deg, ${barColor}, color-mix(in srgb, ${barColor} 60%, #000))` : 'rgba(255,255,255,0.04)'),
                    borderRadius: '6px 6px 2px 2px',
                    boxShadow: hoveredDay?.date === day.date ? `0 0 15px ${barColor}` : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />

                  {/* X Axis Label */}
                  <span style={{ 
                    fontSize: '0.65rem', 
                    marginTop: '6px', 
                    color: isToday ? '#10b981' : 'var(--text-muted)', 
                    fontWeight: isToday ? 700 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}>
                    {isToday ? 'Today' : day.label.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Cumulative Progress Growth Curve (SVG Line Chart) */}
        <div className="glass-panel" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>🚀 Cumulative Growth Curve (All-Time Trajectory)</h3>
            <span className="font-fun" style={{ fontSize: '1rem', color: '#10b981' }}>
              Total Reached: {runningTotal} {selectedCatId === 'all' ? 'units' : categoriesStats.find(c=>c.id===selectedCatId)?.unit}
            </span>
          </div>

          <div style={{ position: 'relative', height: '160px', width: '100%', paddingTop: '1rem' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              
              {/* Grid lines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
              <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.1)" />

              {/* Area Fill */}
              {dateSeries.length > 1 && (
                <polygon
                  points={`0,100 ${cumulativeSeries.map((d, i) => {
                    const x = (i / (cumulativeSeries.length - 1)) * 100;
                    const y = 100 - (d.cumulative / maxCumulativeVal) * 90;
                    return `${x},${y}`;
                  }).join(' ')} 100,100`}
                  fill="rgba(6, 182, 212, 0.15)"
                />
              )}

              {/* Line Path */}
              {dateSeries.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={cumulativeSeries.map((d, i) => {
                    const x = (i / (cumulativeSeries.length - 1)) * 100;
                    const y = 100 - (d.cumulative / maxCumulativeVal) * 90;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              )}

              {/* Dots for each point */}
              {cumulativeSeries.map((d, i) => {
                const x = (i / (cumulativeSeries.length - 1)) * 100;
                const y = 100 - (d.cumulative / maxCumulativeVal) * 90;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={hoveredDay?.date === d.date ? "4" : "1.5"}
                    fill={hoveredDay?.date === d.date ? "#ec4899" : "#fff"}
                    style={{ transition: 'all 0.2s' }}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Section 3: Activity History Feed (Edit / Delete Logs) */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📜</span> Detailed Activity Log Feed
          </h3>

          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              No activity recorded in this range yet. Click "➕ Record Today's Activity!" on the dashboard to get started!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.4rem' }}>
              {filteredLogs.map(log => {
                const catObj = categoriesStats.find(c => c.id === log.categoryId);
                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-primary)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `4px solid ${catObj?.color || '#8b5cf6'}`,
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>{catObj?.icon || '⭐'}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          {catObj?.name || 'Activity'}: <strong className="font-fun" style={{ color: catObj?.color || '#8b5cf6', fontSize: '1.1rem' }}>{log.amount} {catObj?.unit}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          📅 {log.date} {log.note ? `• "${log.note}"` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="btn btn-secondary"
                      title="Delete this record"
                      style={{ padding: '0.4rem', width: '36px', height: '36px', borderColor: 'transparent', color: '#ef4444' }}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 4: Review Questions Feedback Summary */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📚</span> Review Questions Feedback Logs
          </h3>

          {/* Stats Summary Badges */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div className="glass-panel" style={{ flex: 1, minWidth: '120px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>👍 Good Answers</div>
              <div className="font-fun" style={{ fontSize: '1.5rem', color: '#10b981', fontWeight: 700 }}>
                {(profile.reviewLogs || []).filter(l => l.status === 'good').length}
              </div>
            </div>
            <div className="glass-panel" style={{ flex: 1, minWidth: '120px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⚠️ Needs Review</div>
              <div className="font-fun" style={{ fontSize: '1.5rem', color: '#f59e0b', fontWeight: 700 }}>
                {(profile.reviewLogs || []).filter(l => l.status === 'need_review').length}
              </div>
            </div>
            <div className="glass-panel" style={{ flex: 1, minWidth: '120px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>👀 Visited/Opened</div>
              <div className="font-fun" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                {(profile.reviewLogs || []).filter(l => l.status === 'viewed').length}
              </div>
            </div>
          </div>

          {((profile.reviewLogs || []).filter(l => l.status === 'good' || l.status === 'need_review')).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No question feedbacks recorded yet. Parents can ask and log reviews in Parent Mode!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.4rem' }}>
              {((profile.reviewLogs || []).filter(l => l.status === 'good' || l.status === 'need_review')).map(log => {
                const qDetails = getQuestionDetails(log.questionId, log.fileKey);
                if (!qDetails) return null;
                const isGood = log.status === 'good';
                
                return (
                  <div
                    key={`${log.fileKey}-${log.questionId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-primary)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `4px solid ${isGood ? '#10b981' : '#f59e0b'}`,
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.2rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {qDetails.fileTitle} {qDetails.lesson ? `• ${qDetails.lesson}` : ''}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {qDetails.title || qDetails.question}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Reviewed on: {log.date}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: isGood ? '#10b981' : '#f59e0b',
                        background: isGood ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700
                      }}>
                        {isGood ? '👍 Good' : '⚠️ Review'}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm("Remove this feedback log?")) {
                            storageService.recordReviewFeedback(log.questionId, log.fileKey, 'viewed');
                            onRefresh();
                          }
                        }}
                        className="btn btn-secondary"
                        title="Remove feedback log"
                        style={{ padding: '0.4rem', width: '32px', height: '32px', borderColor: 'transparent', color: 'var(--text-muted)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', maxWidth: '280px' }}>
            ✓ Close Statistics
          </button>
        </div>

      </div>
    </div>
  );
};
