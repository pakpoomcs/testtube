import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const { profile, updateProfile } = useAuth();
  const [preferences, setPreferences] = useState({
    self_assessed_level: null,
    target_exams: [],
    daily_goal: 10,
  });

  // Sync with profile on mount/change
  useEffect(() => {
    if (profile) {
      setPreferences({
        self_assessed_level: profile.self_assessed_level || null,
        target_exams: Array.isArray(profile.target_exams) ? profile.target_exams : [],
        daily_goal: typeof profile.daily_goal === "number" ? profile.daily_goal : 10,
      });
    }
  }, [profile]);

  const updatePreferences = async (updates) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);

    // Persist to profile
    try {
      await updateProfile(newPrefs);
    } catch (err) {
      console.error("Failed to update preferences:", err);
      throw err;
    }
  };

  const value = {
    preferences,
    updatePreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}
