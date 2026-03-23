// Dashboard Preferences Context
import React, { createContext, useState, useCallback, useEffect } from 'react';

export const DashboardContext = createContext();

const DEFAULT_WIDGETS = [
  { id: 'sales-overview', title: 'Sales Overview', enabled: true, size: 'medium' },
  { id: 'top-products', title: 'Top Products', enabled: true, size: 'medium' },
  { id: 'recent-orders', title: 'Recent Orders', enabled: true, size: 'large' },
  { id: 'inventory-status', title: 'Inventory Status', enabled: true, size: 'medium' },
  { id: 'analytics', title: 'Analytics', enabled: true, size: 'medium' },
  { id: 'shop-info', title: 'Shop Info', enabled: true, size: 'small' },
];

export const DashboardProvider = ({ children }) => {
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    const savedDateRange = localStorage.getItem('dashboardDateRange');

    if (savedWidgets) {
      try {
        setWidgets(JSON.parse(savedWidgets));
      } catch (e) {
        console.error('Failed to load saved widgets:', e);
      }
    }

    if (savedDateRange) {
      try {
        setDateRange(JSON.parse(savedDateRange));
      } catch (e) {
        console.error('Failed to load saved date range:', e);
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
    localStorage.setItem('dashboardDateRange', JSON.stringify(dateRange));
  }, [widgets, dateRange]);

  const toggleWidget = useCallback((widgetId) => {
    setWidgets(prev =>
      prev.map(w => w.id === widgetId ? { ...w, enabled: !w.enabled } : w)
    );
  }, []);

  const reorderWidgets = useCallback((fromIndex, toIndex) => {
    setWidgets(prev => {
      const newWidgets = [...prev];
      const [removed] = newWidgets.splice(fromIndex, 1);
      newWidgets.splice(toIndex, 0, removed);
      return newWidgets;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
  }, []);

  const updateDateRange = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);

  const value = {
    widgets,
    dateRange,
    isCustomizing,
    setIsCustomizing,
    toggleWidget,
    reorderWidgets,
    resetToDefault,
    updateDateRange,
    savePreferences,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
