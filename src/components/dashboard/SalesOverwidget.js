import React, { useEffect, useState } from 'react';
import tiktokShopService from '../../services/tiktokShopService';

export const SalesOverviewWidget = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await tiktokShopService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Sales Overview</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-600">${metrics?.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">Total Orders</p>
          <p className="text-2xl font-bold text-green-600">{metrics?.totalOrders}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-600">{metrics?.conversionRate}%</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">Avg Order Value</p>
          <p className="text-2xl font-bold text-orange-600">${metrics?.avgOrderValue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default SalesOverviewWidget;
