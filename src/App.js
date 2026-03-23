// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { ThemeProvider } from "./context/ThemeContext";
import { DashboardProvider } from "./context/DashboardContext";
import AppLayout from "./components/AppLayout";
import PageTransition from "./components/PageTransition";
import TestScreen from "./pages/TestScreen";
import ReportScreen from "./pages/ReportScreen";
import SinglePageHub from "./pages/SinglePageHub";
import AuthScreen from "./pages/AuthScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import ResetPasswordScreen from "./pages/ResetPasswordScreen";
import PricingPage from "./pages/PricingPage";
import TikTokShopDashboard from "./pages/TikTokShopDashboard";

function AppRoutes() {
  return (
    <AppLayout>
      <PageTransition>
        <Routes>
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/tiktok-shop" element={<TikTokShopDashboard />} />
          <Route path="/" element={<SinglePageHub />} />
          <Route path="/practice" element={<SinglePageHub />} />
          <Route path="/test/:examId" element={<TestScreen />} />
          <Route path="/report" element={<ReportScreen />} />
          <Route path="/dashboard" element={<SinglePageHub />} />
          <Route path="/profile" element={<SinglePageHub />} />
          <Route path="/admin" element={<SinglePageHub />} />
        </Routes>
      </PageTransition>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PreferencesProvider>
          <SubscriptionProvider>
            <DashboardProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </DashboardProvider>
          </SubscriptionProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
