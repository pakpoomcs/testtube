// src/components/AppLayout.js
import React from "react";
import { useLocation } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";

// Pages where the tab bar should be hidden
const HIDE_TAB_BAR = ["/test", "/report", "/onboarding", "/auth"];

function AppLayout({ children }) {
  const location = useLocation();
  const hideBar = HIDE_TAB_BAR.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div style={{ paddingBottom: hideBar ? 0 : "72px" }}>
      {children}
      {!hideBar && <BottomTabBar />}
    </div>
  );
}

export default AppLayout;
