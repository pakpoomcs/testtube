// src/context/SubscriptionContext.js
// Provides subscription status and daily question usage to the whole app.
// Reads subscription_status / subscription_expires_at from AuthContext profile.
// Counts today's answered questions from user_results.

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabaseClient";

const FREE_DAILY_LIMIT = 50;

const SubscriptionContext = createContext({});

export function SubscriptionProvider({ children }) {
  const { user, profile } = useAuth();
  const [todayCount, setTodayCount] = useState(0);
  const [loadingUsage, setLoadingUsage] = useState(false);

  const isPremium =
    profile?.subscription_status === "premium" &&
    (profile?.subscription_expires_at == null ||
      new Date(profile.subscription_expires_at) > new Date());

  const canAnswerQuestion = isPremium || todayCount < FREE_DAILY_LIMIT;
  const questionsRemaining = isPremium ? Infinity : Math.max(0, FREE_DAILY_LIMIT - todayCount);

  const fetchTodayCount = useCallback(async () => {
    if (!user?.id) { setTodayCount(0); return; }
    setLoadingUsage(true);
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("user_results")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString());
      if (error) throw error;
      setTodayCount(count ?? 0);
    } catch (err) {
      console.error("fetchTodayCount error:", err.message);
    } finally {
      setLoadingUsage(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTodayCount();
  }, [fetchTodayCount]);

  return (
    <SubscriptionContext.Provider value={{
      isPremium,
      todayCount,
      loadingUsage,
      canAnswerQuestion,
      questionsRemaining,
      FREE_DAILY_LIMIT,
      refetchUsage: fetchTodayCount,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
