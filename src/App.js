// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppLayout from "./components/AppLayout";
import TestScreen from "./pages/TestScreen";
import ReportScreen from "./pages/ReportScreen";
import SinglePageHub from "./pages/SinglePageHub";

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<SinglePageHub />} />
        <Route path="/practice" element={<SinglePageHub />} />
        <Route path="/test/:examId" element={<TestScreen />} />
        <Route path="/report" element={<ReportScreen />} />
        <Route path="/dashboard" element={<SinglePageHub />} />
        <Route path="/profile" element={<SinglePageHub />} />
        <Route path="/admin" element={<SinglePageHub />} />
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
