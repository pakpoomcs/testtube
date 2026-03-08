// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ExamBrowser from './pages/ExamBrowser'
import TestScreen from './pages/TestScreen'
import ReportScreen from './pages/ReportScreen'
import AuthScreen from './pages/AuthScreen'
import Dashboard from './pages/Dashboard'
import AdminPage from './pages/AdminPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/auth" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/" element={
        <ProtectedRoute><ExamBrowser /></ProtectedRoute>
      } />
      <Route path="/test/:examId" element={
        <ProtectedRoute><TestScreen /></ProtectedRoute>
      } />
      <Route path="/report" element={
        <ProtectedRoute><ReportScreen /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
  <ProtectedRoute><AdminPage /></ProtectedRoute>
} />

    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App