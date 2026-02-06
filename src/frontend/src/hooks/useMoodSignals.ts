import { useState, useEffect, useCallback } from 'react';
import { Mood } from '../backend';

interface SignalData {
  watchPattern: number[]; // Array of watch durations in seconds
  likes: number; // Count of likes
  activity: number; // Count of interactions (shares, comments, etc.)
  lastUpdated: number; // Timestamp
}

const STORAGE_KEY = 'mood_signals';
const MAX_WATCH_HISTORY = 20;

// Heuristic to infer mood from signals
function inferMoodFromSignals(signals: SignalData): Mood | null {
  const { watchPattern, likes, activity } = signals;

  // Need at least some data to infer
  if (watchPattern.length === 0 && likes === 0 && activity === 0) {
    return null;
  }

  // Calculate average watch time
  const avgWatchTime = watchPattern.length > 0
    ? watchPattern.reduce((sum, time) => sum + time, 0) / watchPattern.length
    : 0;

  // Calculate engagement score (normalized)
  const engagementScore = (likes * 2 + activity) / Math.max(watchPattern.length, 1);

  // Mood inference logic:
  // High engagement + longer watch times = excited
  // High engagement + shorter watch times = happy
  // Low engagement + longer watch times = chill
  // Low engagement + shorter watch times = sad

  if (engagementScore > 1.5) {
    return avgWatchTime > 30 ? Mood.excited : Mood.happy;
  } else {
    return avgWatchTime > 30 ? Mood.chill : Mood.sad;
  }
}

export function useMoodSignals() {
  const [signals, setSignals] = useState<SignalData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load mood signals:', e);
    }
    return {
      watchPattern: [],
      likes: 0,
      activity: 0,
      lastUpdated: Date.now(),
    };
  });

  // Persist signals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
    } catch (e) {
      console.error('Failed to save mood signals:', e);
    }
  }, [signals]);

  // Record watch pattern (time spent on content)
  const recordWatch = useCallback((durationSeconds: number) => {
    setSignals((prev) => {
      const newWatchPattern = [...prev.watchPattern, durationSeconds];
      // Keep only recent history
      if (newWatchPattern.length > MAX_WATCH_HISTORY) {
        newWatchPattern.shift();
      }
      return {
        ...prev,
        watchPattern: newWatchPattern,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  // Record like action
  const recordLike = useCallback(() => {
    setSignals((prev) => ({
      ...prev,
      likes: prev.likes + 1,
      lastUpdated: Date.now(),
    }));
  }, []);

  // Record activity (share, comment, etc.)
  const recordActivity = useCallback(() => {
    setSignals((prev) => ({
      ...prev,
      activity: prev.activity + 1,
      lastUpdated: Date.now(),
    }));
  }, []);

  // Get inferred mood
  const inferredMood = inferMoodFromSignals(signals);

  // Reset signals
  const resetSignals = useCallback(() => {
    const emptySignals: SignalData = {
      watchPattern: [],
      likes: 0,
      activity: 0,
      lastUpdated: Date.now(),
    };
    setSignals(emptySignals);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    signals,
    inferredMood,
    recordWatch,
    recordLike,
    recordActivity,
    resetSignals,
  };
}
