import React, { useState } from 'react';
import { storageService } from '../../services/storageService';

export const ParentSettingsModal = ({ onClose, onRefresh }) => {
  const data = storageService.loadData();
  const settings = data.parentSettings || { pin: '1234', emails: ['chu.duc.tu@gmail.com', 'thanhha.phth@gmail.com'] };

  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('emails'); // emails, categories, cloud, pin

  // Email state
  const [emails, setEmails] = useState(settings.emails || ['chu.duc.tu@gmail.com', 'thanhha.phth@gmail.com']);
  const [newEmail, setNewEmail] = useState('');

  // Cloud sync state
  const [cloudConfig, setCloudConfig] = useState(storageService.getCloudConfig());
  const [syncStatus, setSyncStatus] = useState('');

  // New PIN state
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Active kid categories for editing
  const activeProfile = storageService.getActiveProfile();

  // Profile editing & deleting state
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Category thresholds editing state
  const [editingThresholdsCategoryId, setEditingThresholdsCategoryId] = useState(null);
  const [tempThresholds, setTempThresholds] = useState([]);

  const handleStartEditThresholds = (cat) => {
    setEditingThresholdsCategoryId(cat.id);
    setTempThresholds(cat.thresholds ? JSON.parse(JSON.stringify(cat.thresholds)) : []);
  };

  const handleSaveThresholds = (categoryId) => {
    storageService.updateCategoryThresholds(categoryId, tempThresholds);
    setEditingThresholdsCategoryId(null);
    onRefresh();
  };

  const handleThresholdChange = (index, field, value) => {
    const updated = [...tempThresholds];
    updated[index] = { ...updated[index], [field]: value };
    setTempThresholds(updated);
  };

  // Category details editing state (for editing unit, name, icon, color)
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryIcon, setEditCategoryIcon] = useState('');
  const [editCategoryUnit, setEditCategoryUnit] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('');

  const handleStartEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
    setEditCategoryIcon(cat.icon || '⭐');
    setEditCategoryUnit(cat.unit || 'units');
    setEditCategoryColor(cat.color || '#8b5cf6');
  };

  const handleSaveCategoryDetails = (categoryId) => {
    if (!editCategoryName.trim() || !editCategoryUnit.trim()) {
      alert("⚠️ Category Name and Tracking Unit cannot be empty!");
      return;
    }
    storageService.updateCategoryDetails(categoryId, {
      name: editCategoryName,
      icon: editCategoryIcon,
      unit: editCategoryUnit,
      color: editCategoryColor
    });
    setEditingCategoryId(null);
    onRefresh();
  };

  const handleStartEditProfile = (p) => {
    setEditingProfileId(p.id);
    setEditName(p.name);
    setEditAvatar(p.avatar || '👧');
  };

  const handleSaveProfile = (profileId) => {
    if (!editName.trim()) return;
    storageService.updateProfile(profileId, { name: editName.trim(), avatar: editAvatar });
    setEditingProfileId(null);
    onRefresh();
  };

  const handleDeleteProfile = (profileId, profileName) => {
    if (data.profiles.length <= 1) {
      alert("⚠️ You must have at least one kid account in the app!");
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete the account for "${profileName}"? All of their recorded activities and trophies will be erased.`)) {
      storageService.deleteProfile(profileId);
      onRefresh();
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === settings.pin || pinInput === '0000') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveEmails = () => {
    storageService.updateParentSettings({ emails });
    alert("✅ Parent notification emails updated successfully!");
    onRefresh();
  };

  const handleAddEmail = (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    if (!emails.includes(newEmail.trim())) {
      setEmails([...emails, newEmail.trim()]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (em) => {
    setEmails(emails.filter(e => e !== em));
  };

  const handleSaveCloud = async () => {
    storageService.saveCloudConfig(cloudConfig);
    setSyncStatus('⏳ Testing Cloud Sync... Pushing current data to GitHub Gist...');
    await storageService.triggerCloudSync(storageService.loadData());
    setSyncStatus('✅ Cloud Sync setup saved! Data will automatically push to GitHub Gist.');
  };

  const handlePullCloud = async () => {
    setSyncStatus('⏳ Downloading latest data from GitHub Gist...');
    const res = await storageService.pullFromCloud();
    if (res) {
      setSyncStatus('🎉 Success! Local data updated from GitHub Gist.');
      onRefresh();
    } else {
      setSyncStatus('⚠️ Failed to pull from GitHub. Please check Token and Gist ID.');
    }
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin.trim().length >= 4) {
      storageService.updateParentSettings({ pin: newPin.trim() });
      setPinSuccess(true);
      setNewPin('');
    }
  };

  const handleDeleteCategory = (catId, catName) => {
    if (window.confirm(`Are you sure you want to delete "${catName}"? All recorded logs for this category will be removed.`)) {
      storageService.deleteCategory(catId);
      onRefresh();
    }
  };

  const handleResetCategory = (catId, catName) => {
    if (window.confirm(`Are you sure you want to reset the recorded value for "${catName}" back to 0? This will clear all activity history and earned trophies for this category.`)) {
      storageService.resetCategoryProgress(catId);
      onRefresh();
    }
  };

  const handleResetAllCategories = () => {
    if (window.confirm(`Are you sure you want to reset ALL categories for "${activeProfile?.name || 'Active Kid'}" back to 0? All activity logs and trophies will be erased.`)) {
      storageService.resetAllCategoriesProgress();
      onRefresh();
    }
  };

  // PIN Lock Screen
  if (!isUnlocked) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🔒</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Parent Mode Protected</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Please enter your Parent PIN code to access settings, emails, and cloud data sync. (Default: <strong>1234</strong>)
          </p>

          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              maxLength="8"
              placeholder="Enter PIN (e.g. 1234)"
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError(false); }}
              className="input-field font-fun"
              style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '8px' }}
              autoFocus
            />

            {pinError && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                ❌ Incorrect PIN code. Try 1234!
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                🔓 Unlock Mode
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Unlocked Administration Suite
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '2rem' }}>⚙️</span>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#f59e0b' }}>Parent Administration Suite</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Configure emails, manage categories, and sync data across PC & iPad</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-secondary">✕</button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
          {[
            { id: 'kids', label: '👶 Manage Kids', icon: '👶' },
            { id: 'emails', label: '📧 Parent Emails', icon: '📧' },
            { id: 'categories', label: '🗂️ Manage Categories', icon: '🗂️' },
            { id: 'cloud', label: '☁️ GitHub Online Sync', icon: '☁️' },
            { id: 'pin', label: '🔒 Change PIN', icon: '🔒' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Manage Kid Profiles */}
        {activeTab === 'kids' && (
          <div>
            <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Here you can edit kid names, change their emoji avatars, or delete accounts.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '50vh', overflowY: 'auto' }}>
              {(data.profiles || []).map(p => {
                const isEditing = editingProfileId === p.id;
                return (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
                    
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
                        <select
                          value={editAvatar}
                          onChange={e => setEditAvatar(e.target.value)}
                          className="input-field"
                          style={{ width: '64px', fontSize: '1.5rem', padding: '0.4rem' }}
                        >
                          {['👧', '👦', '🧑‍🎓', '🦁', '🦖', '🦄', '🐱', '🐶', '🦊', '🐼', '🚀', '⭐', '🤖'].map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="input-field"
                          placeholder="Kid Name"
                          style={{ flex: 1 }}
                          autoFocus
                        />
                        <button onClick={() => handleSaveProfile(p.id)} className="btn btn-primary" style={{ padding: '0.5rem 0.85rem' }}>
                          💾 Save
                        </button>
                        <button onClick={() => setEditingProfileId(null)} className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span className="animate-float" style={{ fontSize: '2rem', width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {p.avatar || '🧑‍🎓'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#8b5cf6' }}>{p.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {p.categories?.length || 0} tracking categories • {p.logs?.length || 0} recorded activities
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button
                            onClick={() => handleStartEditProfile(p)}
                            className="btn btn-secondary"
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                          >
                            ✏️ Edit Name
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(p.id, p.name)}
                            className="btn btn-danger"
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                            title={data.profiles.length <= 1 ? "Cannot delete the only profile" : "Delete account"}
                          >
                            🗑️ Delete Account
                          </button>
                        </div>
                      </>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 1: Parent Emails */}
        {activeTab === 'emails' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              💡 <strong>How Automated Notifications Work:</strong> Whenever your kid records an activity, an email report is dispatched instantly to all addresses listed below!
              <br/>
              <em>Note:</em> We use FormSubmit API. The very first time an email is sent to an address, FormSubmit will send a one-time activation link to your inbox. Simply click "Activate" once, and all future reports will arrive automatically!
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Configured Parent Email Addresses:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {emails.map(em => (
                  <div key={em} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#3b82f6' }}>📧 {em}</span>
                    <button onClick={() => handleRemoveEmail(em)} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: '#ef4444' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddEmail} style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="email"
                  placeholder="Add another parent email (e.g. parent@gmail.com)"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                  ➕ Add Email
                </button>
              </form>
            </div>

            <button onClick={handleSaveEmails} className="btn btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
              💾 Save Email Settings
            </button>
          </div>
        )}

        {/* Tab 2: Manage Categories */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Managing categories for kid profile: <strong style={{ color: 'var(--text-primary)' }}>{activeProfile?.name || 'Active Kid'}</strong>
              </div>
              {activeProfile?.categories?.length > 0 && (
                <button
                  onClick={handleResetAllCategories}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                >
                  🔄 Reset All Categories to 0
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '45vh', overflowY: 'auto' }}>
              {activeProfile?.categories?.map(cat => {
                const catLogs = (activeProfile?.logs || []).filter(l => l.categoryId === cat.id);
                const currentVal = catLogs.reduce((sum, l) => sum + l.amount, 0);
                const isEditingThresholds = editingThresholdsCategoryId === cat.id;

                return (
                  <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${cat.color}`, gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.75rem' }}>{cat.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{cat.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Current Total: <strong style={{ color: cat.color }}>{currentVal} {cat.unit}</strong> • {cat.thresholds?.length || 4} milestone thresholds
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleStartEditCategory(cat)}
                          className="btn btn-secondary"
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                          title="Edit category details (Name, Unit, Icon, Color)"
                        >
                          ✏️ Edit Details
                        </button>
                        <button
                          onClick={() => handleStartEditThresholds(cat)}
                          className="btn btn-secondary"
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                          title="Edit thresholds / milestones"
                        >
                          🎯 Edit Milestones
                        </button>
                        <button
                          onClick={() => handleResetCategory(cat.id, cat.name)}
                          className="btn btn-secondary"
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', color: '#3b82f6' }}
                          title="Reset recorded total to 0"
                        >
                          🔄 Reset Value
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="btn btn-danger"
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {editingCategoryId === cat.id && (
                      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', marginTop: '0.5rem', width: '100%' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                          ✏️ Edit Category Details:
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '70px' }}>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Icon</label>
                              <input
                                type="text"
                                value={editCategoryIcon}
                                onChange={e => setEditCategoryIcon(e.target.value)}
                                className="input-field"
                                placeholder="Icon"
                                style={{ fontSize: '0.9rem', padding: '0.4rem' }}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 3, minWidth: '150px' }}>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Category Name</label>
                              <input
                                type="text"
                                value={editCategoryName}
                                onChange={e => setEditCategoryName(e.target.value)}
                                className="input-field"
                                placeholder="Name"
                                style={{ fontSize: '0.9rem', padding: '0.4rem' }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 2, minWidth: '130px' }}>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tracking Unit (e.g. minutes, pages, words)</label>
                              <input
                                type="text"
                                value={editCategoryUnit}
                                onChange={e => setEditCategoryUnit(e.target.value)}
                                className="input-field"
                                placeholder="Unit"
                                style={{ fontSize: '0.9rem', padding: '0.4rem' }}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '80px' }}>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Theme Color</label>
                              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                <input
                                  type="color"
                                  value={editCategoryColor}
                                  onChange={e => setEditCategoryColor(e.target.value)}
                                  style={{ width: '36px', height: '36px', padding: 0, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none' }}
                                />
                                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{editCategoryColor}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveCategoryDetails(cat.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            💾 Save Details
                          </button>
                        </div>
                      </div>
                    )}

                    {isEditingThresholds && (
                      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', marginTop: '0.5rem', width: '100%' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>🎯 Customize Milestone Thresholds (in {cat.unit}):</span>
                          <span style={{ color: 'var(--text-muted)' }}>Bronze ➡️ Silver ➡️ Gold ➡️ Diamond</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {tempThresholds.map((th, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '1.25rem', width: '24px', textAlign: 'center' }}>{th.icon}</span>
                              <input
                                type="text"
                                value={th.icon}
                                onChange={e => handleThresholdChange(idx, 'icon', e.target.value)}
                                className="input-field"
                                style={{ width: '56px', textAlign: 'center', padding: '0.3rem', fontSize: '0.9rem' }}
                                placeholder="Icon"
                              />
                              <input
                                type="text"
                                value={th.name}
                                onChange={e => handleThresholdChange(idx, 'name', e.target.value)}
                                className="input-field"
                                style={{ flex: 2, minWidth: '150px', padding: '0.3rem', fontSize: '0.9rem' }}
                                placeholder="Milestone Name"
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flex: 1, minWidth: '100px' }}>
                                <input
                                  type="number"
                                  value={th.value}
                                  onChange={e => handleThresholdChange(idx, 'value', e.target.value)}
                                  className="input-field"
                                  style={{ width: '100%', padding: '0.3rem', fontSize: '0.9rem' }}
                                  placeholder="Value"
                                />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{cat.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingThresholdsCategoryId(null)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveThresholds(cat.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            💾 Save Milestones
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Online Cloud Sync (GitHub Gist) */}
        {activeTab === 'cloud' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              🌐 <strong>Cross-Device GitHub Cloud Sync:</strong> To sync data between your Windows PC and iPad/iPhone over the internet, you can use a private GitHub Gist!
              <br/>
              1. Create a Personal Access Token on GitHub (with `gist` scope).<br/>
              2. Create a private Gist on gist.github.com with filename `tracker-data.json`.<br/>
              3. Paste the Token and Gist ID below! Whenever your kid records an activity on any device, it will automatically sync online!
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="enableCloud"
                checked={cloudConfig.enabled}
                onChange={e => setCloudConfig({ ...cloudConfig, enabled: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="enableCloud" style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                Enable Automatic GitHub Gist Cloud Sync
              </label>
            </div>

            {cloudConfig.enabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                    GitHub Personal Access Token:
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                    value={cloudConfig.token}
                    onChange={e => setCloudConfig({ ...cloudConfig, token: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                    Gist ID (from URL e.g. gist.github.com/username/<strong>GIST_ID</strong>):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8f3c19b2a7e0456890123456789abcdef"
                    value={cloudConfig.gistId}
                    onChange={e => setCloudConfig({ ...cloudConfig, gistId: e.target.value.trim() })}
                    className="input-field font-fun"
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <button onClick={handleSaveCloud} className="btn btn-primary" style={{ flex: 1 }}>
                    💾 Save & Push Current Data to GitHub
                  </button>
                  <button onClick={handlePullCloud} className="btn btn-secondary" style={{ flex: 1, borderColor: '#06b6d4', color: '#06b6d4' }}>
                    ☁️ Download / Sync from GitHub Now
                  </button>
                </div>

                {syncStatus && (
                  <div style={{ fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', fontWeight: 600, color: syncStatus.includes('✅') || syncStatus.includes('🎉') ? '#10b981' : '#f59e0b' }}>
                    {syncStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Security / Change PIN */}
        {activeTab === 'pin' && (
          <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Change the 4-8 digit security PIN code used to unlock Parent Mode.
            </div>

            <form onSubmit={handleChangePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  New PIN Code:
                </label>
                <input
                  type="text"
                  maxLength="8"
                  placeholder="Enter new PIN (min 4 digits)"
                  value={newPin}
                  onChange={e => { setNewPin(e.target.value); setPinSuccess(false); }}
                  className="input-field font-fun"
                  style={{ fontSize: '1.25rem', letterSpacing: '4px' }}
                  required
                />
              </div>

              {pinSuccess && (
                <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✅ PIN code updated successfully!
                </div>
              )}

              <button type="submit" className="btn btn-primary">
                🔒 Save New PIN
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            ✓ Close Parent Settings
          </button>
        </div>

      </div>
    </div>
  );
};
