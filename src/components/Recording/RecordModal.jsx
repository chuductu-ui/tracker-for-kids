import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { emailService } from '../../services/emailService';

// Built-in HTML5 Canvas Confetti Celebration
function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ffffff'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + 100,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 1) * 20 - 5,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 15,
      alpha: 1
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    frame++;

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5; // gravity
      p.rot += p.vRot;
      p.alpha -= 0.008;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }
    }

    if (active && frame < 180) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  }
  animate();
}

export const RecordModal = ({ category, onClose, onRecorded }) => {
  const [amount, setAmount] = useState(category?.unit === 'mins' ? 30 : 10);
  const [note, setNote] = useState('');
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockedTrophy, setUnlockedTrophy] = useState(null);

  if (!category) return null;

  const quickAdd = (delta) => {
    setAmount(prev => {
      const newVal = Math.max(0, Number(prev) + delta);
      return Number(newVal.toFixed(2));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalAmount = Number(amount);
    if (isNaN(finalAmount) || finalAmount <= 0 || isSubmitting) return;

    setIsSubmitting(true);

    // 1. Record activity in storage
    const result = storageService.recordActivity(category.id, finalAmount, note, recordDate);
    
    // 2. Trigger Confetti!
    triggerConfetti();

    // 3. Send email to parents in background
    if (result) {
      emailService.sendActivityReport({
        profileName: result.profileName,
        categoryName: result.categoryName,
        amount: finalAmount,
        unit: result.unit,
        totalAllTime: result.totalAllTime,
        unlockedMilestone: result.unlockedMilestone,
        note,
        date: recordDate
      }).catch(err => console.error("Email dispatch failed:", err));
    }

    // 4. Check if new milestone unlocked
    if (result && result.unlockedMilestone) {
      setUnlockedTrophy(result.unlockedMilestone);
      setIsSubmitting(false);
      // Wait for user to celebrate trophy before closing
    } else {
      setIsSubmitting(false);
      onRecorded();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={unlockedTrophy ? undefined : onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ borderTop: `4px solid ${category.color || '#8b5cf6'}` }}>
        
        {/* If Milestone Unlocked -> Celebration Screen! */}
        {unlockedTrophy ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div className="animate-float" style={{ fontSize: '5rem', marginBottom: '1rem' }}>
              {unlockedTrophy.icon || '🏆'}
            </div>
            <h2 style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
              CONGRATULATIONS! 🎉
            </h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              You just unlocked the milestone: <br/>
              <strong style={{ fontSize: '1.3rem', color: category.color || '#8b5cf6' }}>{unlockedTrophy.name}</strong>
            </p>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              📧 An automated email celebration report has been sent to your parents' inbox!
            </div>
            <button 
              onClick={() => { onRecorded(); onClose(); }} 
              className="btn btn-primary animate-pulse-glow" 
              style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}
            >
              🌟 Awesome! Return to Dashboard
            </button>
          </div>
        ) : (
          /* Normal Recording Form */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Record {category.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>How much did you practice today?</span>
                </div>
              </div>
              <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Main Number Input with Quick Touch Steppers */}
              <div style={{ textAlign: 'center', background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                  Amount Completed ({category.unit})
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <button 
                    type="button" 
                    onClick={() => quickAdd(-5)} 
                    className="btn btn-secondary"
                    style={{ width: '50px', height: '50px', fontSize: '1.5rem', padding: 0, borderRadius: 'var(--radius-full)' }}
                  >
                    -
                  </button>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <input 
                      type="number" 
                      min="0.01" 
                      step="0.01"
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      className="font-fun"
                      style={{ 
                        width: '120px', 
                        fontSize: '3rem', 
                        textAlign: 'center', 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontWeight: 700
                      }}
                      required
                    />
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{category.unit}</span>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => quickAdd(5)} 
                    className="btn btn-secondary"
                    style={{ width: '50px', height: '50px', fontSize: '1.5rem', padding: 0, borderRadius: 'var(--radius-full)' }}
                  >
                    +
                  </button>
                </div>

                {/* Quick Add Pills for iPad / Mobile touch */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[+5, +10, +15, +30, +60].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => quickAdd(val)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', minHeight: '36px', borderRadius: 'var(--radius-full)' }}
                    >
                      +{val} {category.unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Date Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  📅 Activity Date (You can change this to a past date!):
                </label>
                <input 
                  type="date" 
                  className="input-field font-fun" 
                  value={recordDate} 
                  max={new Date().toISOString().split('T')[0]} // Do not allow future dates
                  onChange={e => setRecordDate(e.target.value)} 
                  style={{ fontSize: '1rem', padding: '0.6rem 0.8rem', width: '100%' }}
                />
              </div>

              {/* Optional Note Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  📝 Note / Comment (Optional):
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Learned 10 animal names, read Chapter 4..." 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                />
              </div>

              {/* Notice about automated emails */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(139, 92, 246, 0.08)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                📧 An automated summary email will be sent to your parents upon saving!
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 2, background: `linear-gradient(135deg, ${category.color || '#8b5cf6'}, #3b82f6)` }}>
                  {isSubmitting ? '⏳ Recording & Sending Email...' : '🎉 Record & Celebrate!'}
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
};
