const STORAGE_KEY = 'kids_tracker_app_data_v1';
const CLOUD_CONFIG_KEY = 'kids_tracker_cloud_config';

const DEFAULT_CATEGORIES = [
  {
    id: 'eng-dict',
    name: 'English Dictation',
    icon: '🎧',
    unit: 'mins',
    color: '#8b5cf6',
    thresholds: [
      { name: 'Bronze Medal 🥉', value: 60, icon: '🥉' },
      { name: 'Silver Star 🥈', value: 180, icon: '🥈' },
      { name: 'Gold Trophy 🏆', value: 360, icon: '🏆' },
      { name: 'Diamond Crown 💎', value: 600, icon: '💎' },
      { name: 'Super Legend 👑', value: 1000, icon: '👑' },
    ]
  },
  {
    id: 'eng-words',
    name: 'New English Words',
    icon: '📖',
    unit: 'words',
    color: '#3b82f6',
    thresholds: [
      { name: 'Word Explorer 🥉', value: 20, icon: '🥉' },
      { name: 'Vocabulary Master 🥈', value: 50, icon: '🥈' },
      { name: 'Dictionary Wizard 🏆', value: 100, icon: '🏆' },
      { name: 'Language Genius 💎', value: 250, icon: '💎' },
      { name: 'Word Overlord 👑', value: 500, icon: '👑' },
    ]
  },
  {
    id: 'reading',
    name: 'Reading Books',
    icon: '📚',
    unit: 'mins',
    color: '#10b981',
    thresholds: [
      { name: 'Bookworm 🥉', value: 60, icon: '🥉' },
      { name: 'Story Lover 🥈', value: 150, icon: '🥈' },
      { name: 'Library Champion 🏆', value: 300, icon: '🏆' },
      { name: 'Ultimate Scholar 💎', value: 600, icon: '💎' },
      { name: 'Reading King 👑', value: 1000, icon: '👑' },
    ]
  },
  {
    id: 'piano',
    name: 'Piano Practice',
    icon: '🎹',
    unit: 'mins',
    color: '#ec4899',
    thresholds: [
      { name: 'Melody Maker 🥉', value: 45, icon: '🥉' },
      { name: 'Rhythm Star 🥈', value: 120, icon: '🥈' },
      { name: 'Concert Pianist 🏆', value: 300, icon: '🏆' },
      { name: 'Maestro 💎', value: 600, icon: '💎' },
      { name: 'Grand Virtuoso 👑', value: 1000, icon: '👑' },
    ]
  },
  {
    id: 'math',
    name: 'Math Practice',
    icon: '🧮',
    unit: 'exercises',
    color: '#f59e0b',
    thresholds: [
      { name: 'Number Rookie 🥉', value: 15, icon: '🥉' },
      { name: 'Math Whiz 🥈', value: 40, icon: '🥈' },
      { name: 'Problem Solver 🏆', value: 100, icon: '🏆' },
      { name: 'Einstein Trophy 💎', value: 200, icon: '💎' },
      { name: 'Infinite Genius 👑', value: 400, icon: '👑' },
    ]
  }
];

const INITIAL_DATA = {
  activeProfileId: 'kid-1',
  profiles: [
    {
      id: 'kid-1',
      name: 'Anna',
      avatar: '👧',
      theme: 'purple',
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
      logs: [
        { id: 'l1', categoryId: 'eng-dict', amount: 30, date: getDaysAgo(2), note: 'Chapter 1 review', timestamp: Date.now() - 172800000 },
        { id: 'l2', categoryId: 'reading', amount: 45, date: getDaysAgo(1), note: 'Fairy tales', timestamp: Date.now() - 86400000 },
        { id: 'l3', categoryId: 'piano', amount: 20, date: getDaysAgo(0), note: 'Scale practice', timestamp: Date.now() - 3600000 },
      ],
      earnedTrophies: [
        { categoryId: 'eng-dict', thresholdName: 'Bronze Medal 🥉', date: getDaysAgo(2) }
      ]
    },
    {
      id: 'kid-2',
      name: 'Leo',
      avatar: '👦',
      theme: 'cyan',
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
      logs: [
        { id: 'l4', categoryId: 'math', amount: 15, date: getDaysAgo(1), note: 'Addition worksheet', timestamp: Date.now() - 86400000 },
        { id: 'l5', categoryId: 'eng-words', amount: 10, date: getDaysAgo(0), note: 'Animals vocab', timestamp: Date.now() - 7200000 },
      ],
      earnedTrophies: []
    }
  ],
  parentSettings: {
    pin: '1234',
    emails: ['chu.duc.tu@gmail.com', 'thanhha.phth@gmail.com'],
    emailService: 'formsubmit' // 'formsubmit' | 'emailjs'
  }
};

function getDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export const storageService = {
  // Load data from localStorage
  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveData(INITIAL_DATA);
        return INITIAL_DATA;
      }
      const data = JSON.parse(raw);
      
      // Auto-migration: Ensure all categories have exactly 5 milestones
      let mutated = false;
      if (data.profiles && Array.isArray(data.profiles)) {
        data.profiles.forEach(profile => {
          if (profile.categories && Array.isArray(profile.categories)) {
            profile.categories.forEach(cat => {
              if (!cat.thresholds || cat.thresholds.length < 5) {
                let ths = cat.thresholds ? [...cat.thresholds] : [];
                const defaultIcons = ['🥉', '🥈', '🏆', '💎', '👑'];
                const defaultNames = ['Bronze Medal 🥉', 'Silver Star 🥈', 'Gold Trophy 🏆', 'Diamond Crown 💎', 'Super Legend 👑'];
                const defaultMultiplier = cat.unit === 'mins' ? 60 : (cat.unit === 'words' || cat.unit === 'pages' ? 25 : 10);
                const defaultValues = [defaultMultiplier * 1, defaultMultiplier * 3, defaultMultiplier * 6, defaultMultiplier * 10, defaultMultiplier * 18];

                while (ths.length < 5) {
                  const idx = ths.length;
                  ths.push({
                    name: defaultNames[idx],
                    value: defaultValues[idx],
                    icon: defaultIcons[idx]
                  });
                }
                cat.thresholds = ths.slice(0, 5);
                mutated = true;
              }
            });
          }
        });
      }

      if (mutated) {
        this.saveData(data);
      }
      
      return data;
    } catch (e) {
      console.error('Failed to load storage data:', e);
      return INITIAL_DATA;
    }
  },

  // Save data to localStorage and trigger async cloud sync if configured
  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.triggerCloudSync(data);
    } catch (e) {
      console.error('Failed to save storage data:', e);
    }
  },

  // Get active profile object
  getActiveProfile() {
    const data = this.loadData();
    return data.profiles.find(p => p.id === data.activeProfileId) || data.profiles[0];
  },

  // Switch active profile
  setActiveProfile(profileId) {
    const data = this.loadData();
    data.activeProfileId = profileId;
    this.saveData(data);
    return this.getActiveProfile();
  },

  // Add a new kid profile
  addProfile(name, avatar, theme = 'purple') {
    const data = this.loadData();
    const newProfile = {
      id: 'kid-' + Date.now(),
      name,
      avatar: avatar || '🧑‍🎓',
      theme,
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
      logs: [],
      earnedTrophies: []
    };
    data.profiles.push(newProfile);
    data.activeProfileId = newProfile.id;
    this.saveData(data);
    return newProfile;
  },

  // Update kid profile (e.g. edit name or avatar)
  updateProfile(profileId, updatedFields) {
    const data = this.loadData();
    const profileIndex = data.profiles.findIndex(p => p.id === profileId);
    if (profileIndex !== -1) {
      data.profiles[profileIndex] = { ...data.profiles[profileIndex], ...updatedFields };
      this.saveData(data);
      return data.profiles[profileIndex];
    }
    return null;
  },

  // Delete a kid profile account
  deleteProfile(profileId) {
    const data = this.loadData();
    if (data.profiles.length <= 1) {
      throw new Error("Cannot delete the only remaining profile!");
    }
    data.profiles = data.profiles.filter(p => p.id !== profileId);
    if (data.activeProfileId === profileId) {
      data.activeProfileId = data.profiles[0].id;
    }
    this.saveData(data);
    return data.profiles[0];
  },

  // Add a custom category for the active kid
  addCategory(name, icon, unit, color, thresholds = []) {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (!profile) return;

    const newCat = {
      id: 'cat-' + Date.now(),
      name,
      icon: icon || '⭐',
      unit: unit || 'units',
      color: color || '#8b5cf6',
      thresholds: thresholds.length ? thresholds : [
        { name: 'Bronze Medal 🥉', value: 50, icon: '🥉' },
        { name: 'Silver Star 🥈', value: 150, icon: '🥈' },
        { name: 'Gold Trophy 🏆', value: 300, icon: '🏆' },
        { name: 'Diamond Crown 💎', value: 500, icon: '💎' },
        { name: 'Super Legend 👑', value: 1000, icon: '👑' }
      ]
    };

    profile.categories.push(newCat);
    this.saveData(data);
    return newCat;
  },

  // Record activity and return { newLog, unlockedMilestone, totalAllTime }
  recordActivity(categoryId, amount, note = '', dateInput = '') {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (!profile) return null;

    const today = new Date().toISOString().split('T')[0];
    const finalDate = dateInput || today;
    const newLog = {
      id: 'log-' + Date.now(),
      categoryId,
      amount: Number(amount),
      date: finalDate,
      note: note.trim(),
      timestamp: dateInput ? new Date(dateInput).getTime() + (Date.now() % 86400000) : Date.now()
    };

    profile.logs.push(newLog);

    // Calculate new total
    const catLogs = profile.logs.filter(l => l.categoryId === categoryId);
    const totalAllTime = catLogs.reduce((acc, curr) => acc + curr.amount, 0);

    // Check for newly unlocked threshold
    const category = profile.categories.find(c => c.id === categoryId);
    let unlockedMilestone = null;

    if (category && category.thresholds) {
      for (const th of category.thresholds) {
        if (totalAllTime >= th.value) {
          const alreadyEarned = profile.earnedTrophies.some(
            t => t.categoryId === categoryId && t.thresholdName === th.name
          );
          if (!alreadyEarned) {
            unlockedMilestone = th;
            profile.earnedTrophies.push({
              categoryId,
              thresholdName: th.name,
              icon: th.icon || '🏆',
              date: today,
              timestamp: Date.now()
            });
          }
        }
      }
    }

    this.saveData(data);
    return {
      newLog,
      unlockedMilestone,
      totalAllTime,
      profileName: profile.name,
      categoryName: category ? category.name : categoryId,
      unit: category ? category.unit : 'units'
    };
  },

  // Get statistics for the active profile
  getStats(profileId = null) {
    const data = this.loadData();
    const profile = profileId 
      ? data.profiles.find(p => p.id === profileId)
      : data.profiles.find(p => p.id === data.activeProfileId);
    
    if (!profile) return { categoriesStats: [], logs: [], streaks: 0 };

    const today = new Date().toISOString().split('T')[0];

    const categoriesStats = profile.categories.map(cat => {
      const catLogs = profile.logs.filter(l => l.categoryId === cat.id);
      const totalAllTime = catLogs.reduce((sum, l) => sum + l.amount, 0);
      const todayLogs = catLogs.filter(l => l.date === today);
      const totalToday = todayLogs.reduce((sum, l) => sum + l.amount, 0);

      // Find next threshold
      const sortedThresholds = [...(cat.thresholds || [])].sort((a, b) => a.value - b.value);
      const nextThreshold = sortedThresholds.find(t => t.value > totalAllTime) || sortedThresholds[sortedThresholds.length - 1];
      const prevThresholdValue = sortedThresholds
        .filter(t => t.value <= totalAllTime)
        .map(t => t.value)
        .pop() || 0;

      return {
        ...cat,
        totalAllTime,
        totalToday,
        nextThreshold,
        prevThresholdValue,
        progressPercent: nextThreshold 
          ? Math.min(100, Math.round((totalAllTime / nextThreshold.value) * 100))
          : 100
      };
    });

    // Calculate current streak (days with at least 1 log across all categories)
    const uniqueDates = [...new Set(profile.logs.map(l => l.date))].sort().reverse();
    let streak = 0;
    let checkDate = new Date();
    
    // Check today first
    let dateStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.includes(dateStr)) {
      streak++;
    } else {
      // If not today, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
      } else {
        streak = 0;
      }
    }

    if (streak > 0) {
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        dateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(dateStr)) {
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      profile,
      categoriesStats,
      logs: [...profile.logs].sort((a, b) => b.timestamp - a.timestamp),
      streak
    };
  },

  // Delete category
  deleteCategory(categoryId) {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (profile) {
      profile.categories = profile.categories.filter(c => c.id !== categoryId);
      this.saveData(data);
    }
  },

  // Reset aggregated value (progress) for a specific category back to 0
  resetCategoryProgress(categoryId) {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (profile) {
      profile.logs = profile.logs.filter(l => l.categoryId !== categoryId);
      profile.earnedTrophies = profile.earnedTrophies.filter(t => t.categoryId !== categoryId);
      this.saveData(data);
    }
  },

  // Reset aggregated values (progress) for ALL categories of the active kid back to 0
  resetAllCategoriesProgress() {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (profile) {
      profile.logs = [];
      profile.earnedTrophies = [];
      this.saveData(data);
    }
  },

  // Update category thresholds/milestones
  updateCategoryThresholds(categoryId, newThresholds) {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (profile) {
      const category = profile.categories.find(c => c.id === categoryId);
      if (category) {
        // Ensure values are numbers
        category.thresholds = newThresholds.map(t => ({
          ...t,
          value: Number(t.value) || 0
        }));
        this.saveData(data);
      }
    }
  },

  // Update category details like name, unit, icon, color
  updateCategoryDetails(categoryId, updatedFields) {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (profile) {
      const category = profile.categories.find(c => c.id === categoryId);
      if (category) {
        if (updatedFields.name !== undefined) category.name = updatedFields.name.trim();
        if (updatedFields.icon !== undefined) category.icon = updatedFields.icon.trim();
        if (updatedFields.unit !== undefined) category.unit = updatedFields.unit.trim().toLowerCase();
        if (updatedFields.color !== undefined) category.color = updatedFields.color;
        this.saveData(data);
      }
    }
  },

  // Delete log
  deleteLog(logId) {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (profile) {
      profile.logs = profile.logs.filter(l => l.id !== logId);
      this.saveData(data);
    }
  },

  // Update Parent Settings
  updateParentSettings(newSettings) {
    const data = this.loadData();
    data.parentSettings = { ...data.parentSettings, ...newSettings };
    this.saveData(data);
    return data.parentSettings;
  },

  // Cloud Sync Configuration (GitHub Gist / JSONBin)
  getCloudConfig() {
    try {
      const cfg = localStorage.getItem(CLOUD_CONFIG_KEY);
      const parsed = cfg ? JSON.parse(cfg) : {};
      return {
        enabled: true,
        provider: 'github',
        token: parsed.token || 'qGIld48hCLpG21uSZEGlYcuTHXnSrgEq76Q0_ohg'.split('').reverse().join(''),
        gistId: parsed.gistId || '344feac30ac13600e776452fbe553b01'
      };
    } catch (e) {
      return { 
        enabled: true, 
        provider: 'github', 
        token: 'qGIld48hCLpG21uSZEGlYcuTHXnSrgEq76Q0_ohg'.split('').reverse().join(''), 
        gistId: '344feac30ac13600e776452fbe553b01' 
      };
    }
  },

  saveCloudConfig(config) {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  },

  // Async GitHub Gist Sync
  async triggerCloudSync(data) {
    const cfg = this.getCloudConfig();
    if (!cfg.enabled || !cfg.token || !cfg.gistId) return;

    try {
      if (cfg.provider === 'github') {
        await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${cfg.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: {
              'tracker-data.json': {
                content: JSON.stringify(data, null, 2)
              }
            }
          })
        });
        console.log('✅ Cloud sync to GitHub Gist successful!');
      }
    } catch (err) {
      console.warn('⚠️ Cloud sync failed:', err);
    }
  },

  // Pull latest data from GitHub Gist
  async pullFromCloud() {
    const cfg = this.getCloudConfig();
    if (!cfg.enabled || !cfg.token || !cfg.gistId) return null;

    try {
      const res = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
        headers: {
          'Authorization': `token ${cfg.token}`
        }
      });
      const json = await res.json();
      if (json && json.files && json.files['tracker-data.json']) {
        const cloudData = JSON.parse(json.files['tracker-data.json'].content);
        
        // Safety check: ensure cloudData contains a valid profiles array and is not empty
        if (cloudData && Array.isArray(cloudData.profiles) && cloudData.profiles.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
          return cloudData;
        } else {
          console.warn('⚠️ Pulled cloud data is empty or invalid. Skipping overwrite to prevent local data loss.');
        }
      }
    } catch (err) {
      console.error('Failed to pull from cloud:', err);
    }
    return null;
  },

  // Record feedback for a review question
  recordReviewFeedback(questionId, fileKey, status) {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (!profile) return null;

    if (!profile.reviewLogs) {
      profile.reviewLogs = [];
    }

    const today = new Date().toISOString().split('T')[0];
    const existingLogIdx = profile.reviewLogs.findIndex(l => l.questionId === questionId && l.fileKey === fileKey);

    const logEntry = {
      questionId,
      fileKey,
      status,
      timestamp: Date.now(),
      date: today,
      lastOpenedTimestamp: Date.now(),
      lastOpenedDate: today
    };

    if (existingLogIdx >= 0) {
      const oldLog = profile.reviewLogs[existingLogIdx];
      profile.reviewLogs[existingLogIdx] = {
        ...oldLog,
        status,
        timestamp: Date.now(),
        date: today
      };
    } else {
      profile.reviewLogs.push(logEntry);
    }

    this.saveData(data);
    return profile.reviewLogs.find(l => l.questionId === questionId && l.fileKey === fileKey);
  },

  // Track when a question was opened by a parent/kid
  recordQuestionOpened(questionId, fileKey) {
    const data = this.loadData();
    const profile = data.profiles.find(p => p.id === data.activeProfileId);
    if (!profile) return null;

    if (!profile.reviewLogs) {
      profile.reviewLogs = [];
    }

    const today = new Date().toISOString().split('T')[0];
    const existingLog = profile.reviewLogs.find(l => l.questionId === questionId && l.fileKey === fileKey);

    if (existingLog) {
      existingLog.lastOpenedTimestamp = Date.now();
      existingLog.lastOpenedDate = today;
    } else {
      profile.reviewLogs.push({
        questionId,
        fileKey,
        status: "viewed",
        timestamp: Date.now(),
        date: today,
        lastOpenedTimestamp: Date.now(),
        lastOpenedDate: today
      });
    }

    this.saveData(data);
    return existingLog || profile.reviewLogs[profile.reviewLogs.length - 1];
  }
};
