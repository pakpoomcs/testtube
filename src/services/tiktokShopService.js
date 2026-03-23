// TikTok Shop API Service
// Replace with actual API credentials and endpoints

const TIKTOK_SHOP_BASE_URL = process.env.REACT_APP_TIKTOK_SHOP_API_URL || 'https://api.tiktokshop.com/v1';
const TIKTOK_SHOP_TOKEN = process.env.REACT_APP_TIKTOK_SHOP_TOKEN;

// Mock data for development
const MOCK_DATA = {
  shop: {
    name: "My TikTok Shop",
    shopId: "123456789",
    followers: 15420,
    verified: true,
  },
  metrics: {
    totalRevenue: 12450.50,
    totalOrders: 342,
    conversionRate: 3.2,
    avgOrderValue: 36.40,
  },
  topProducts: [
    { id: 1, name: "Wireless Earbuds", sales: 156, revenue: 4680, rating: 4.8 },
    { id: 2, name: "Phone Case", sales: 142, revenue: 1278, rating: 4.6 },
    { id: 3, name: "USB Cable", sales: 98, revenue: 686, rating: 4.5 },
    { id: 4, name: "Screen Protector", sales: 76, revenue: 380, rating: 4.4 },
  ],
  recentOrders: [
    { id: 1, orderId: "ORD001", customer: "John Doe", amount: 45.99, status: "delivered", date: "2026-03-23" },
    { id: 2, orderId: "ORD002", customer: "Jane Smith", amount: 92.50, status: "processing", date: "2026-03-22" },
    { id: 3, orderId: "ORD003", customer: "Bob Johnson", amount: 28.75, status: "shipped", date: "2026-03-21" },
    { id: 4, orderId: "ORD004", customer: "Alice Brown", amount: 156.00, status: "delivered", date: "2026-03-20" },
  ],
  inventory: [
    { id: 1, name: "Wireless Earbuds", sku: "WE001", stock: 45, status: "in-stock" },
    { id: 2, name: "Phone Case", sku: "PC002", stock: 12, status: "low-stock" },
    { id: 3, name: "USB Cable", sku: "UC003", stock: 0, status: "out-of-stock" },
    { id: 4, name: "Screen Protector", sku: "SP004", stock: 234, status: "in-stock" },
  ],
  analytics: {
    clicks: 4250,
    impressions: 18640,
    ctr: 22.8,
    avgCpc: 0.45,
    followers: 15420,
    engagement: 8.2,
  },
};

export const tiktokShopService = {
  // Get shop information
  getShopInfo: async () => {
    try {
      // Replace with actual API call
      // const response = await fetch(`${TIKTOK_SHOP_BASE_URL}/shop`, {
      //   headers: { 'Authorization': `Bearer ${TIKTOK_SHOP_TOKEN}` }
      // });
      // return response.json();
      return MOCK_DATA.shop;
    } catch (error) {
      console.error('Error fetching shop info:', error);
      throw error;
    }
  },

  // Get sales metrics
  getMetrics: async (dateRange = { start: '2026-03-01', end: '2026-03-31' }) => {
    try {
      // Replace with actual API call
      return MOCK_DATA.metrics;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  },

  // Get top products
  getTopProducts: async (limit = 10) => {
    try {
      // Replace with actual API call
      return MOCK_DATA.topProducts.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },

  // Get recent orders
  getRecentOrders: async (limit = 20) => {
    try {
      // Replace with actual API call
      return MOCK_DATA.recentOrders.slice(0, limit);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get inventory status
  getInventory: async () => {
    try {
      // Replace with actual API call
      return MOCK_DATA.inventory;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  // Get analytics data
  getAnalytics: async (dateRange = { start: '2026-03-01', end: '2026-03-31' }) => {
    try {
      // Replace with actual API call
      return MOCK_DATA.analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Get detailed product performance
  getProductPerformance: async (productId) => {
    try {
      // Replace with actual API call
      const product = MOCK_DATA.topProducts.find(p => p.id === productId);
      return product || null;
    } catch (error) {
      console.error('Error fetching product performance:', error);
      throw error;
    }
  },

  // Export data (CSV or JSON)
  exportData: async (dataType = 'orders', format = 'csv') => {
    try {
      let data = [];

      if (dataType === 'orders') {
        data = MOCK_DATA.recentOrders;
      } else if (dataType === 'products') {
        data = MOCK_DATA.topProducts;
      } else if (dataType === 'inventory') {
        data = MOCK_DATA.inventory;
      }

      if (format === 'csv') {
        return convertToCSV(data);
      } else if (format === 'json') {
        return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },
};

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');

  return csvContent;
}

export default tiktokShopService;
