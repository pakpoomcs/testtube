import React, { useEffect, useState } from 'react';
import tiktokShopService from '../../services/tiktokShopService';

export const AnalyticsWidget = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await tiktokShopService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Analytics</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">Clicks</p>
          <p className="text-2xl font-bold text-indigo-600">{analytics?.clicks.toLocaleString()}</p>
        </div>

        <div className="bg-cyan-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">Impressions</p>
          <p className="text-2xl font-bold text-cyan-600">{analytics?.impressions.toLocaleString()}</p>
        </div>

        <div className="bg-pink-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">CTR</p>
          <p className="text-2xl font-bold text-pink-600">{analytics?.ctr}%</p>
        </div>

        <div className="bg-teal-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">Avg CPC</p>
          <p className="text-2xl font-bold text-teal-600">${analytics?.avgCpc.toFixed(2)}</p>
        </div>

        <div className="bg-rose-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">Followers</p>
          <p className="text-2xl font-bold text-rose-600">{analytics?.followers.toLocaleString()}</p>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-2">Engagement Rate</p>
          <p className="text-2xl font-bold text-amber-600">{analytics?.engagement}%</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
