import React from 'react';
import { useDashboard } from '../../context/DashboardContext';

export const DashboardCustomizer = () => {
  const {
    widgets,
    toggleWidget,
    resetToDefault,
    savePreferences,
    setIsCustomizing,
  } = useDashboard();

  const handleSave = () => {
    savePreferences();
    setIsCustomizing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Customize Dashboard</h2>
        <button
          onClick={() => setIsCustomizing(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        Toggle widgets to show/hide them on your dashboard
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {widgets.map(widget => (
          <label key={widget.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={widget.enabled}
              onChange={() => toggleWidget(widget.id)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <p className="font-medium text-gray-800">{widget.title}</p>
              <p className="text-xs text-gray-500">Size: {widget.size}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Save Preferences
        </button>
        <button
          onClick={() => {
            resetToDefault();
            setIsCustomizing(false);
          }}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default DashboardCustomizer;
