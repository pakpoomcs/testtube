# TikTok Shop Dashboard Setup Guide

This document explains how to set up and configure the TikTok Shop Dashboard in your application.

## Features

The TikTok Shop Dashboard includes:

- **Sales Overview**: Total revenue, orders, conversion rate, and average order value
- **Top Products**: Best-selling products with revenue and ratings
- **Recent Orders**: Order tracking with customer info, amounts, and status
- **Inventory Status**: Real-time inventory levels with low-stock alerts
- **Analytics**: Clicks, impressions, CTR, CPC, followers, and engagement metrics
- **Shop Info**: Shop verification status and follower count

## Customization Features

- **Widget Toggle**: Show/hide specific widgets
- **Date Range Filtering**: Filter data by custom date ranges
- **Data Export**: Export orders, products, or inventory as CSV or JSON
- **Persistent Preferences**: Customizations are saved to localStorage

## Setup Instructions

### 1. Environment Variables

Create a `.env` or `.env.local` file in your project root and add:

```env
REACT_APP_TIKTOK_SHOP_API_URL=https://api.tiktokshop.com/v1
REACT_APP_TIKTOK_SHOP_TOKEN=your_tiktok_shop_api_token_here
```

### 2. Get TikTok Shop API Credentials

1. Go to [TikTok Shop Seller Center](https://seller.tiktokshop.com)
2. Navigate to Settings > API & Tools
3. Create a new application and get your API credentials
4. Add the API token to your `.env` file

### 3. Update API Service

Edit `src/services/tiktokShopService.js` and replace mock API calls with actual endpoints:

```javascript
// Example: Replace mock data with actual API calls
export const tiktokShopService = {
  getShopInfo: async () => {
    const response = await fetch(`${TIKTOK_SHOP_BASE_URL}/shop`, {
      headers: { 'Authorization': `Bearer ${TIKTOK_SHOP_TOKEN}` }
    });
    return response.json();
  },

  getMetrics: async (dateRange) => {
    const response = await fetch(
      `${TIKTOK_SHOP_BASE_URL}/analytics/metrics?start=${dateRange.start}&end=${dateRange.end}`,
      { headers: { 'Authorization': `Bearer ${TIKTOK_SHOP_TOKEN}` } }
    );
    return response.json();
  },
  // ... implement other methods similarly
};
```

### 4. Access the Dashboard

Navigate to `/tiktok-shop` in your application to view the dashboard.

## API Endpoints Reference

### Get Shop Information
```
GET /shop
Returns: { name, shopId, followers, verified }
```

### Get Sales Metrics
```
GET /analytics/metrics?start=YYYY-MM-DD&end=YYYY-MM-DD
Returns: { totalRevenue, totalOrders, conversionRate, avgOrderValue }
```

### Get Top Products
```
GET /products/top?limit=10
Returns: [{ id, name, sales, revenue, rating }]
```

### Get Recent Orders
```
GET /orders?limit=20
Returns: [{ id, orderId, customer, amount, status, date }]
```

### Get Inventory
```
GET /inventory
Returns: [{ id, name, sku, stock, status }]
```

### Get Analytics Data
```
GET /analytics?start=YYYY-MM-DD&end=YYYY-MM-DD
Returns: { clicks, impressions, ctr, avgCpc, followers, engagement }
```

## Data Points Included

### Sales Metrics
- Total Revenue (monthly/custom date range)
- Total Orders
- Conversion Rate (%)
- Average Order Value

### Product Analytics
- Top selling products
- Product sales count
- Product revenue
- Product ratings

### Order Management
- Order ID
- Customer name
- Order amount
- Order status (delivered, processing, shipped, cancelled)
- Order date

### Inventory Tracking
- Product name
- SKU
- Current stock level
- Stock status (in-stock, low-stock, out-of-stock)

### Shop Analytics
- Clicks
- Impressions
- Click-through rate (CTR)
- Average cost per click (CPC)
- Follower count
- Engagement rate (%)

## Customization Options

### Add New Widgets

1. Create a new widget component in `src/components/dashboard/`
2. Add it to the WIDGET_COMPONENTS mapping in `TikTokShopDashboard.js`
3. Add it to DEFAULT_WIDGETS in `DashboardContext.js`

Example widget:
```javascript
export const CustomWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await tiktokShopService.getCustomData();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Your widget content */}
    </div>
  );
};
```

### Modify Date Range
Users can customize the date range for metrics through the UI. The preference is saved automatically.

### Export Data
Users can export data in CSV or JSON format for further analysis.

## File Structure

```
src/
├── services/
│   └── tiktokShopService.js       # API service layer
├── context/
│   └── DashboardContext.js         # Dashboard preferences context
├── components/
│   └── dashboard/
│       ├── SalesOverwidget.js      # Sales metrics widget
│       ├── TopProductsWidget.js    # Top products widget
│       ├── RecentOrdersWidget.js   # Recent orders widget
│       ├── InventoryStatusWidget.js # Inventory widget
│       ├── AnalyticsWidget.js      # Analytics widget
│       ├── ShopInfoWidget.js       # Shop info widget
│       └── DashboardCustomizer.js  # Customization panel
└── pages/
    └── TikTokShopDashboard.js      # Main dashboard page
```

## Testing

To test with mock data (development mode):
1. The app comes with mock data configured
2. Navigate to `/tiktok-shop`
3. Test widget visibility toggles and customization

To test with real data:
1. Set up API credentials in `.env`
2. Update API calls in `tiktokShopService.js`
3. Navigate to `/tiktok-shop`

## Troubleshooting

### Widgets not showing
- Check that widgets are enabled in customizer
- Verify API calls are returning data
- Check browser console for errors

### Data not updating
- Verify API credentials are correct
- Check network requests in browser DevTools
- Ensure date range is set correctly

### Export not working
- Verify data is loaded before exporting
- Check browser console for errors
- Ensure sufficient data exists for export

## Future Enhancements

- Real-time data updates with WebSocket
- Custom dashboard layouts
- Advanced filtering and search
- Data visualization charts
- Scheduled reports
- Mobile app integration
- Multi-language support
- Dark mode support
