// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppLayout from "./components/AppLayout";
import TestScreen from "./pages/TestScreen";
import ReportScreen from "./pages/ReportScreen";
import AuthScreen from "./pages/AuthScreen";
import SinglePageHub from "./pages/SinglePageHub";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/auth" element={<AuthScreen />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SinglePageHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <SinglePageHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test/:examId"
          element={
            <ProtectedRoute>
              <TestScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SinglePageHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <SinglePageHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <SinglePageHub />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
