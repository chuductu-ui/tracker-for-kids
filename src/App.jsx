import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { ProfileSwitcher } from './components/Header/ProfileSwitcher';
import { CategoryCard } from './components/Dashboard/CategoryCard';
import { NewCategoryModal } from './components/Dashboard/NewCategoryModal';
import { RecordModal } from './components/Recording/RecordModal';
import { StatsView } from './components/Statistics/StatsView';
import { TrophyRoomModal } from './components/Trophies/TrophyRoomModal';
import { ParentSettingsModal } from './components/ParentMode/ParentSettingsModal';

export default function App() {
  const [activeProfile, setActiveProfile] = useState(() => storageService.getActiveProfile());
  const [statsData, setStatsData] = useState(() => storageService.getStats());
  const [themeMode, setThemeMode] = useState('dark');

  // Modals state
  const [recordingCategory, setRecordingCategory] = useState(null);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showTrophiesModal, setShowTrophiesModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);

  // Refresh stats
  const refreshData = () => {
    const updatedProfile = storageService.getActiveProfile();
    setActiveProfile(updatedProfile);
    setStatsData(storageService.getStats(updatedProfile?.id));
  };

  // On mount, pull from GitHub Gist cloud in background if enabled
  useEffect(() => {
    storageService.pullFromCloud().then(res => {
      if (res) {
        refreshData();
      }
    });
  }, []);

  const handleProfileChange = (newProfile) => {
    setActiveProfile(newProfile);
    setStatsData(storageService.getStats(newProfile?.id));
  };

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  if (!activeProfile || !statsData.profile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
        <h2>⏳ Loading Activity Tracker...</h2>
      </div>
    );
  }

  const { categoriesStats, streak } = statsData;

  return (
    <div style={{ padding: '1rem', maxWidth: '1280px', margin: '0 auto', minHeight: '100vh' }}>
      
      {/* Top Profile Switcher & Action Bar */}
      <ProfileSwitcher
        activeProfile={activeProfile}
        onProfileChange={handleProfileChange}
        onOpenTrophies={() => setShowTrophiesModal(true)}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenParentMode={() => setShowParentModal(true)}
      />

      {/* Hero Welcome & Streak Banner */}
      <div className="glass-card" style={{
        padding: '1.75rem 2rem',
        marginBottom: '2.5rem',
        background: `linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1))`,
        border: '1px solid rgba(139, 92, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="animate-float" style={{ fontSize: '3.5rem', background: 'rgba(255,255,255,0.1)', width: '80px', height: '80px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
            {activeProfile.avatar}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🌟 Anki-Style Active Profile
            </div>
            <h2 style={{ fontSize: '2rem', margin: '0.2rem 0' }}>
              Hello, <span style={{ color: '#8b5cf6' }}>{activeProfile.name}</span>! Ready to shine today?
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
              Pick a category below to record what you practiced. Every record brings you closer to a trophy!
            </p>
          </div>
        </div>

        {/* Streak & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              🔥 Practice Streak
            </div>
            <div className="font-fun" style={{ fontSize: '1.8rem', color: '#10b981' }}>
              {streak} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Days</span>
            </div>
          </div>

          <button onClick={toggleTheme} className="btn btn-secondary btn-icon" title="Toggle Theme (Dark/Light)" style={{ width: '48px', height: '48px', fontSize: '1.3rem' }}>
            {themeMode === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Categories Dashboard Section */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎯</span> Your Tracking Categories
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Click "➕ Record Today's Activity!" to add your progress and earn milestone awards!
          </p>
        </div>

        <button 
          onClick={() => setShowNewCategoryModal(true)} 
          className="btn btn-primary animate-pulse-glow"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', gap: '0.5rem' }}
        >
          <span>✨ + Add New Category!</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid-cards" style={{ marginBottom: '3rem' }}>
        {categoriesStats.map(stat => (
          <CategoryCard
            key={stat.id}
            stat={stat}
            onRecord={(cat) => setRecordingCategory(cat)}
          />
        ))}

        {/* Add Category Kid Card Prompt */}
        <div
          onClick={() => setShowNewCategoryModal(true)}
          className="glass-card"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            border: '2px dashed var(--border-highlight)',
            background: 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer',
            minHeight: '280px',
            gap: '1rem'
          }}
        >
          <div className="animate-float" style={{ fontSize: '3.5rem', width: '72px', height: '72px', borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ➕
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', color: '#10b981', margin: 0 }}>Create Your Own Goal!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem', maxWidth: '240px' }}>
              Want to track Drawing, LEGO, Swimming, or Coding? Add your own fun category right now!
            </p>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: '0.5rem', borderColor: '#10b981', color: '#10b981' }}>
            <span>🚀 Create New Goal</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <footer style={{ textAlign: 'center', padding: '2rem 0', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>🏆 <strong>Kids Activity & Milestone Tracker</strong> • Designed with love for David, Lily & Family!</p>
        <p style={{ marginTop: '0.3rem', fontSize: '0.75rem' }}>
          📧 Automated Parent Notifications sent to: <strong>chu.duc.tu@gmail.com</strong> & <strong>thanhha.phth@gmail.com</strong>
        </p>
      </footer>

      {/* Active Modals */}
      {recordingCategory && (
        <RecordModal
          category={recordingCategory}
          onClose={() => setRecordingCategory(null)}
          onRecorded={refreshData}
        />
      )}

      {showNewCategoryModal && (
        <NewCategoryModal
          onClose={() => setShowNewCategoryModal(false)}
          onCategoryAdded={refreshData}
        />
      )}

      {showTrophiesModal && (
        <TrophyRoomModal
          onClose={() => setShowTrophiesModal(false)}
        />
      )}

      {showStatsModal && (
        <StatsView
          onClose={() => setShowStatsModal(false)}
          onRefresh={refreshData}
        />
      )}

      {showParentModal && (
        <ParentSettingsModal
          onClose={() => setShowParentModal(false)}
          onRefresh={refreshData}
        />
      )}

    </div>
  );
}
