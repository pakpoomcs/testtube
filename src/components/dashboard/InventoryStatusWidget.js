import React, { useEffect, useState } from 'react';
import tiktokShopService from '../../services/tiktokShopService';

const STATUS_INDICATOR = {
  'in-stock': { color: 'bg-green-100 text-green-700', icon: '✓' },
  'low-stock': { color: 'bg-yellow-100 text-yellow-700', icon: '!' },
  'out-of-stock': { color: 'bg-red-100 text-red-700', icon: '✗' },
};

export const InventoryStatusWidget = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ inStock: 0, lowStock: 0, outOfStock: 0 });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await tiktokShopService.getInventory();
        setInventory(data);

        // Calculate stats
        const newStats = {
          inStock: data.filter(item => item.status === 'in-stock').length,
          lowStock: data.filter(item => item.status === 'low-stock').length,
          outOfStock: data.filter(item => item.status === 'out-of-stock').length,
        };
        setStats(newStats);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Inventory Status</h2>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
          <p className="text-xs text-gray-600">In Stock</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
          <p className="text-xs text-gray-600">Low Stock</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          <p className="text-xs text-gray-600">Out of Stock</p>
        </div>
      </div>

      {/* Inventory List */}
      <div className="space-y-2">
        {inventory.map(item => {
          const statusInfo = STATUS_INDICATOR[item.status];
          return (
            <div key={item.id} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-3 flex-1">
                <span className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${statusInfo.color}`}>
                  {statusInfo.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700">{item.stock} units</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryStatusWidget;
