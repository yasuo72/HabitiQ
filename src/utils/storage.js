// src/utils/storage.js

const handleStorageError = (error, defaultValue) => {
  console.error('Storage operation failed:', error);
  return defaultValue;
};

// Helper to get the current user's ID for prefixing storage keys
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || user.id || 'anonymous';
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'anonymous';
  }
};

// Create a user-specific key for localStorage
const getUserKey = (key) => {
  const userId = getUserId();
  return `user_${userId}_${key}`;
};

export const storageUtils = {
  // Journal Entries
  saveJournalEntries: (entries) => {
    try {
      const userKey = getUserKey('journalEntries');
      localStorage.setItem(userKey, JSON.stringify(entries));
      console.log(`Saved ${entries.length} journal entries for user ${getUserId()}`);
      return true;
    } catch (error) {
      return handleStorageError(error, false);
    }
  },

  getJournalEntries: () => {
    try {
      const userKey = getUserKey('journalEntries');
      const entries = localStorage.getItem(userKey);
      const result = entries ? JSON.parse(entries) : [];
      console.log(`Retrieved ${result.length} journal entries for user ${getUserId()}`);
      return result;
    } catch (error) {
      return handleStorageError(error, []);
    }
  },

  addJournalEntry: (entry) => {
    try {
      const entries = storageUtils.getJournalEntries();
      // Ensure entry has a timestamp
      const entryWithTimestamp = {
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString()
      };
      const updatedEntries = [entryWithTimestamp, ...entries];
      storageUtils.saveJournalEntries(updatedEntries);
      return updatedEntries;
    } catch (error) {
      return handleStorageError(error, null);
    }
  },

  // Analysis Data
  saveAnalysis: (data) => {
    try {
      const timestamp = new Date().toISOString();
      const analysisWithTimestamp = {
        ...data,
        timestamp
      };
      const userAnalysisKey = getUserKey('journalAnalysis');
      localStorage.setItem(userAnalysisKey, JSON.stringify(analysisWithTimestamp));

      // Update analysis history
      const userHistoryKey = getUserKey('journalAnalysisHistory');
      const existingHistory = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
      const updatedHistory = [
        analysisWithTimestamp,
        ...existingHistory.filter(item => item.timestamp !== timestamp)
      ].slice(0, 30); // Keep last 30 analyses

      localStorage.setItem(userHistoryKey, JSON.stringify(updatedHistory));
      console.log(`Saved analysis data for user ${getUserId()}`);
      return true;
    } catch (error) {
      return handleStorageError(error, false);
    }
  },

  getAnalysis: () => {
    try {
      const userAnalysisKey = getUserKey('journalAnalysis');
      const analysis = localStorage.getItem(userAnalysisKey);
      return analysis ? JSON.parse(analysis) : null;
    } catch (error) {
      return handleStorageError(error, null);
    }
  },

  getAnalysisHistory: () => {
    try {
      const userHistoryKey = getUserKey('journalAnalysisHistory');
      const history = localStorage.getItem(userHistoryKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      return handleStorageError(error, []);
    }
  },

  // Nutrition Data
  saveNutritionData: (meals, waterIntake) => {
    try {
      const userNutritionKey = getUserKey('nutritionData');
      localStorage.setItem(userNutritionKey, JSON.stringify({
        meals,
        waterIntake,
        timestamp: new Date().toISOString()
      }));
      console.log(`Saved nutrition data for user ${getUserId()}`);
      return true;
    } catch (error) {
      return handleStorageError(error, false);
    }
  },

  getNutritionData: () => {
    try {
      const userNutritionKey = getUserKey('nutritionData');
      const data = localStorage.getItem(userNutritionKey);
      return data ? JSON.parse(data) : { meals: [], waterIntake: 0, timestamp: null };
    } catch (error) {
      return handleStorageError(error, { meals: [], waterIntake: 0, timestamp: null });
    }
  },

  // Goals Data
  saveGoalsData: (goals, habits) => {
    try {
      const userGoalsKey = getUserKey('goalsData');
      localStorage.setItem(userGoalsKey, JSON.stringify({
        goals,
        habits,
        timestamp: new Date().toISOString()
      }));
      console.log(`Saved goals data for user ${getUserId()}`);
      return true;
    } catch (error) {
      return handleStorageError(error, false);
    }
  },

  getGoalsData: () => {
    try {
      const userGoalsKey = getUserKey('goalsData');
      const data = localStorage.getItem(userGoalsKey);
      return data ? JSON.parse(data) : { goals: [], habits: [], timestamp: null };
    } catch (error) {
      return handleStorageError(error, { goals: [], habits: [], timestamp: null });
    }
  },
  
  // Clear all data for the current user
  clearUserData: () => {
    try {
      const userId = getUserId();
      console.log(`Clearing all data for user ${userId}`);
      
      // Remove all user-specific items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`user_${userId}_`)) {
          localStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      return handleStorageError(error, false);
    }
  }
};