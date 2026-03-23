import React, { useEffect, useState } from 'react';
import tiktokShopService from '../../services/tiktokShopService';

export const ShopInfoWidget = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const data = await tiktokShopService.getShopInfo();
        setShop(data);
      } catch (error) {
        console.error('Failed to fetch shop info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopInfo();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>;
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{shop?.name}</h2>
        {shop?.verified && <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold">✓ Verified</span>}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-blue-100 text-xs mb-1">Shop ID</p>
          <p className="font-semibold text-sm">{shop?.shopId}</p>
        </div>

        <div className="pt-2 border-t border-blue-400">
          <p className="text-blue-100 text-xs mb-1">Followers</p>
          <p className="text-2xl font-bold">{shop?.followers.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ShopInfoWidget;
