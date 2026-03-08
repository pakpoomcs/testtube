// src/components/BottomTabBar.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { theme } from "../styles/theme";

const { colors, fonts } = theme;

function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, profile } = useAuth();

  const showBadge = profile && !profile.onboarding_completed;

  const tabs = [
    { label: "Home", icon: "🏠", path: "/" },
    { label: "Practice", icon: "📝", path: "/practice" },
    { label: "Progress", icon: "📊", path: "/dashboard" },
    { label: "Profile", icon: "👤", path: "/profile", badge: showBadge },
    ...(isAdmin ? [{ label: "Admin", icon: "⚙️", path: "/admin" }] : []),
  ];

  return (
    <div style={styles.bar}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            style={styles.tab}
            onClick={() => navigate(tab.path)}
          >
            <div style={styles.iconWrapper}>
              <span style={active ? styles.iconActive : styles.icon}>
                {tab.icon}
              </span>
              {tab.badge && <div style={styles.badge} />}
            </div>
            <span style={active ? styles.labelActive : styles.label}>
              {tab.label}
            </span>
            {active && <div style={styles.activePill} />}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  bar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "72px",
    backgroundColor: colors.white,
    borderTop: `1px solid ${colors.gray100}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 1000,
    paddingBottom: "env(safe-area-inset-bottom)",
    boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
  },
  tab: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px 0",
    position: "relative",
  },
  iconWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: "22px",
    opacity: 0.4,
    transition: "all 0.2s ease",
  },
  iconActive: {
    fontSize: "22px",
    opacity: 1,
    transition: "all 0.2s ease",
  },
  label: {
    fontFamily: fonts.body,
    fontSize: "11px",
    fontWeight: "500",
    color: colors.gray500,
    transition: "all 0.2s ease",
  },
  labelActive: {
    fontFamily: fonts.body,
    fontSize: "11px",
    fontWeight: "700",
    color: colors.teal,
  },
  activePill: {
    position: "absolute",
    top: "-1px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "24px",
    height: "3px",
    backgroundColor: colors.teal,
    borderRadius: "0 0 4px 4px",
  },
  badge: {
    position: "absolute",
    top: "-2px",
    right: "-4px",
    width: "8px",
    height: "8px",
    backgroundColor: colors.danger,
    borderRadius: "50%",
    border: `2px solid ${colors.white}`,
  },
};

export default BottomTabBar;
