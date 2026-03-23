import React, { useEffect, useState } from 'react';
import tiktokShopService from '../../services/tiktokShopService';

export const TopProductsWidget = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await tiktokShopService.getTopProducts(5);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Top Products</h2>

      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sales} sales</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">${product.revenue.toFixed(2)}</p>
              <p className="text-xs text-yellow-500">⭐ {product.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsWidget;
