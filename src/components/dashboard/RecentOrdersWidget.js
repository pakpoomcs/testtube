import React, { useEffect, useState } from 'react';
import tiktokShopService from '../../services/tiktokShopService';

const STATUS_COLORS = {
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const RecentOrdersWidget = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await tiktokShopService.getRecentOrders(10);
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 text-gray-600 font-medium text-sm">Order ID</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium text-sm">Customer</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium text-sm">Amount</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium text-sm">Status</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium text-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2 text-sm text-gray-800 font-medium">{order.orderId}</td>
                <td className="py-3 px-2 text-sm text-gray-700">{order.customer}</td>
                <td className="py-3 px-2 text-sm text-gray-800 font-semibold">${order.amount.toFixed(2)}</td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-gray-600">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersWidget;
