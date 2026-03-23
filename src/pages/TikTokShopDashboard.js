import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { SalesOverviewWidget } from '../components/dashboard/SalesOverwidget';
import { TopProductsWidget } from '../components/dashboard/TopProductsWidget';
import { RecentOrdersWidget } from '../components/dashboard/RecentOrdersWidget';
import { InventoryStatusWidget } from '../components/dashboard/InventoryStatusWidget';
import { AnalyticsWidget } from '../components/dashboard/AnalyticsWidget';
import { ShopInfoWidget } from '../components/dashboard/ShopInfoWidget';
import { DashboardCustomizer } from '../components/dashboard/DashboardCustomizer';
import tiktokShopService from '../services/tiktokShopService';

const WIDGET_COMPONENTS = {
  'sales-overview': SalesOverviewWidget,
  'top-products': TopProductsWidget,
  'recent-orders': RecentOrdersWidget,
  'inventory-status': InventoryStatusWidget,
  'analytics': AnalyticsWidget,
  'shop-info': ShopInfoWidget,
};

const WIDGET_SIZES = {
  small: 'col-span-1',
  medium: 'col-span-1 md:col-span-2',
  large: 'col-span-1 md:col-span-3',
};

export const TikTokShopDashboard = () => {
  const { widgets, isCustomizing, setIsCustomizing, dateRange, updateDateRange } = useDashboard();
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportType, setExportType] = useState('orders');

  const handleExport = async () => {
    try {
      const data = await tiktokShopService.exportData(exportType, exportFormat);
      const element = document.createElement('a');
      const file = new Blob([data], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `tiktok-shop-${exportType}.${exportFormat}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    }
  };

  const enabledWidgets = widgets.filter(w => w.enabled);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TikTok Shop Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor your shop performance in real-time</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                ⚙️ {isCustomizing ? 'Done' : 'Customize'}
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex gap-4">
                  <div>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => updateDateRange(e.target.value, dateRange.end)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500">to</span>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => updateDateRange(dateRange.start, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="flex gap-2">
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="orders">Orders</option>
                  <option value="products">Products</option>
                  <option value="inventory">Inventory</option>
                </select>

                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>

                <button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                >
                  📥 Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customizer Panel */}
        {isCustomizing && <DashboardCustomizer />}

        {/* Widgets Grid */}
        {enabledWidgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {enabledWidgets.map(widget => {
              const Component = WIDGET_COMPONENTS[widget.id];
              if (!Component) return null;

              return (
                <div key={widget.id} className={WIDGET_SIZES[widget.size]}>
                  <Component />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">No widgets enabled. Click customize to enable widgets.</p>
            <button
              onClick={() => setIsCustomizing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Customize Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TikTokShopDashboard;
