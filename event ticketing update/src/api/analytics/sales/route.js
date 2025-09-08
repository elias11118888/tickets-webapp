function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("30"); // days
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!userLoading) {
      fetchAnalytics();
      fetchEvents();
    }
  }, [userLoading, dateRange, selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 100 }),
      });

      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRange: parseInt(dateRange),
          eventId: selectedEvent === "all" ? null : selectedEvent,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#357AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-roboto">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">Please sign in to view analytics</p>
          <a
            href="/account/signin"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE]"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-600 mr-3"></i>
              <p className="text-red-700 font-roboto">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-roboto">
                Sales Analytics
              </h1>
              <p className="text-gray-600 font-roboto mt-1">
                Track your event performance and revenue
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
              {/* Date Range Filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent font-roboto"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>

              {/* Event Filter */}
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent font-roboto"
              >
                <option value="all">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(analytics?.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm ${
                  analytics?.revenueGrowth >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <i
                  className={`fas ${
                    analytics?.revenueGrowth >= 0
                      ? "fa-arrow-up"
                      : "fa-arrow-down"
                  } mr-1`}
                ></i>
                {formatPercentage(Math.abs(analytics?.revenueGrowth || 0))}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                vs previous period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tickets Sold
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.totalTicketsSold?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-ticket-alt text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm ${
                  analytics?.ticketGrowth >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <i
                  className={`fas ${
                    analytics?.ticketGrowth >= 0
                      ? "fa-arrow-up"
                      : "fa-arrow-down"
                  } mr-1`}
                ></i>
                {formatPercentage(Math.abs(analytics?.ticketGrowth || 0))}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                vs previous period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.totalOrders?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-shopping-cart text-purple-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm ${
                  analytics?.orderGrowth >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <i
                  className={`fas ${
                    analytics?.orderGrowth >= 0
                      ? "fa-arrow-up"
                      : "fa-arrow-down"
                  } mr-1`}
                ></i>
                {formatPercentage(Math.abs(analytics?.orderGrowth || 0))}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                vs previous period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(analytics?.averageOrderValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-line text-orange-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm ${
                  analytics?.aovGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <i
                  className={`fas ${
                    analytics?.aovGrowth >= 0 ? "fa-arrow-up" : "fa-arrow-down"
                  } mr-1`}
                ></i>
                {formatPercentage(Math.abs(analytics?.aovGrowth || 0))}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                vs previous period
              </span>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Trend
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <i className="fas fa-chart-area text-gray-400 text-4xl mb-2"></i>
                <p className="text-gray-500">Revenue chart visualization</p>
                <p className="text-sm text-gray-400">
                  Chart integration coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Methods
            </h3>
            <div className="space-y-4">
              {analytics?.paymentMethods?.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i
                      className={`fas ${getPaymentIcon(
                        method.method
                      )} mr-3 text-[#357AFF]`}
                    ></i>
                    <span className="font-medium capitalize">
                      {method.method.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(method.revenue)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {method.count} orders
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No payment data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Events and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Events */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Performing Events
            </h3>
            <div className="space-y-4">
              {analytics?.topEvents?.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#357AFF] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-500">{event.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#357AFF]">
                      {formatCurrency(event.revenue)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.tickets_sold} tickets
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No event data available
                </p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Orders
            </h3>
            <div className="space-y-4">
              {analytics?.recentOrders?.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {order.buyer_name}
                    </h4>
                    <p className="text-sm text-gray-500">{order.event_title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#357AFF]">
                      {formatCurrency(order.total_amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.quantity} tickets
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {order.payment_method.replace("_", " ")}
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No recent orders
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Export Data
          </h3>
          <div className="flex flex-wrap gap-4">
            <button className="bg-[#357AFF] text-white px-4 py-2 rounded-lg hover:bg-[#2E69DE] transition-colors">
              <i className="fas fa-download mr-2"></i>
              Export CSV
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <i className="fas fa-file-excel mr-2"></i>
              Export Excel
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              <i className="fas fa-file-pdf mr-2"></i>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function getPaymentIcon(method) {
    switch (method) {
      case "credit_card":
        return "fa-credit-card";
      case "mobile_money":
        return "fa-mobile-alt";
      case "paypal":
        return "fa-paypal";
      case "bank_transfer":
        return "fa-university";
      case "crypto":
        return "fa-bitcoin";
      default:
        return "fa-money-bill";
    }
  }
}