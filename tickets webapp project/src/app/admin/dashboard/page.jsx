"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading } = useUser();
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalCommission: 0,
    categoryStats: [],
    topEvents: [],
    recentActivities: [],
    dailyRevenue: [],
    monthlyRevenue: [],
  });
  const [subAdmins, setSubAdmins] = useState([]);
  const [showCreateSubAdmin, setShowCreateSubAdmin] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const [newSubAdmin, setNewSubAdmin] = useState({
    name: "",
    email: "",
    password: "",
    permissions: [],
  });

  useEffect(() => {
    if (user && user.role === "super_admin") {
      fetchDashboardData();
      fetchSubAdmins();
      fetchCategories();
    }
  }, [user, selectedTimeRange, selectedCategory]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      const response = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeRange: selectedTimeRange,
          category: selectedCategory === "all" ? null : selectedCategory,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSubAdmins = async () => {
    try {
      const response = await fetch("/api/admin/sub-admins/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Failed to fetch sub-admins");
      const data = await response.json();
      setSubAdmins(data.subAdmins || []);
    } catch (error) {
      console.error("Error fetching sub-admins:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const createSubAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/sub-admins/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubAdmin),
      });

      if (!response.ok) throw new Error("Failed to create sub-admin");

      setNewSubAdmin({ name: "", email: "", password: "", permissions: [] });
      setShowCreateSubAdmin(false);
      fetchSubAdmins();
    } catch (error) {
      console.error("Error creating sub-admin:", error);
      setError("Failed to create sub-admin");
    }
  };

  const toggleSubAdminStatus = async (subAdminId, currentStatus) => {
    try {
      const response = await fetch("/api/admin/sub-admins/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subAdminId,
          status: currentStatus === "active" ? "inactive" : "active",
        }),
      });

      if (!response.ok) throw new Error("Failed to update sub-admin status");
      fetchSubAdmins();
    } catch (error) {
      console.error("Error updating sub-admin status:", error);
      setError("Failed to update sub-admin status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
          <i className="fas fa-shield-alt text-red-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/80 mb-6">
            This page is only accessible to super administrators.
          </p>
          <a
            href="/"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                EventTix Super Admin
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="/"
                className="text-white/80 hover:text-[#357AFF] transition-colors"
              >
                Home
              </a>
              <a
                href="/events"
                className="text-white/80 hover:text-[#357AFF] transition-colors"
              >
                Events
              </a>
              <a
                href="/admin"
                className="text-white/80 hover:text-[#357AFF] transition-colors"
              >
                Admin
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/90">
                Super Admin: {user.name || user.email}
              </span>
              <a
                href="/account/logout"
                className="text-sm text-white/80 hover:text-[#357AFF] transition-colors"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Super Admin Dashboard
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg px-4 py-2"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg px-4 py-2"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${dashboardData.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <i className="fas fa-dollar-sign text-green-400 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Tickets Sold</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.totalTicketsSold?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <i className="fas fa-ticket-alt text-blue-400 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Commission Earned</p>
                <p className="text-2xl font-bold text-white">
                  ${dashboardData.totalCommission?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <i className="fas fa-percentage text-purple-400 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Active Sub-Admins</p>
                <p className="text-2xl font-bold text-white">
                  {
                    subAdmins.filter((admin) => admin.status === "active")
                      .length
                  }
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <i className="fas fa-users text-orange-400 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Revenue Trend
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {dashboardData.dailyRevenue?.slice(-7).map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-gradient-to-t from-[#357AFF] to-[#00D4FF] rounded-t"
                    style={{
                      height: `${Math.max(
                        (day.revenue /
                          Math.max(
                            ...dashboardData.dailyRevenue.map((d) => d.revenue)
                          )) *
                          200,
                        10
                      )}px`,
                      width: "30px",
                    }}
                  ></div>
                  <span className="text-white/70 text-xs mt-2">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              )) ||
                Array.from({ length: 7 })
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="bg-gray-600 rounded-t h-4 w-8"></div>
                      <span className="text-white/70 text-xs mt-2">-</span>
                    </div>
                  ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Category Performance
            </h3>
            <div className="space-y-4">
              {dashboardData.categoryStats
                ?.slice(0, 5)
                .map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-[#357AFF]"></div>
                      <span className="text-white">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        ${category.revenue?.toLocaleString() || 0}
                      </div>
                      <div className="text-white/70 text-sm">
                        {category.tickets_sold || 0} tickets
                      </div>
                    </div>
                  </div>
                )) || (
                <div className="text-white/70 text-center py-8">
                  No category data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Events and Sub-Admin Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Events */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Top Performing Events
            </h3>
            <div className="space-y-4">
              {dashboardData.topEvents?.slice(0, 5).map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <h4 className="text-white font-medium">{event.title}</h4>
                    <p className="text-white/70 text-sm">{event.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      ${event.revenue?.toLocaleString() || 0}
                    </div>
                    <div className="text-white/70 text-sm">
                      {event.tickets_sold || 0} sold
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-white/70 text-center py-8">
                  No event data available
                </div>
              )}
            </div>
          </div>

          {/* Sub-Admin Management */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Sub-Admin Management
              </h3>
              <button
                onClick={() => setShowCreateSubAdmin(true)}
                className="bg-[#357AFF] text-white px-4 py-2 rounded-lg hover:bg-[#2E69DE] transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>Add Sub-Admin
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {subAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <h4 className="text-white font-medium">{admin.name}</h4>
                    <p className="text-white/70 text-sm">{admin.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        admin.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {admin.status}
                    </span>
                    <button
                      onClick={() =>
                        toggleSubAdminStatus(admin.id, admin.status)
                      }
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <i
                        className={`fas ${
                          admin.status === "active" ? "fa-pause" : "fa-play"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            Recent Activity Log
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData.recentActivities?.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "sale"
                        ? "bg-green-400"
                        : activity.type === "event_created"
                        ? "bg-blue-400"
                        : activity.type === "admin_action"
                        ? "bg-purple-400"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-white">{activity.description}</span>
                </div>
                <span className="text-white/70 text-sm">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            )) || (
              <div className="text-white/70 text-center py-8">
                No recent activities
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Sub-Admin Modal */}
      {showCreateSubAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Create Sub-Admin
              </h3>
              <button
                onClick={() => setShowCreateSubAdmin(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={createSubAdmin} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newSubAdmin.name}
                  onChange={(e) =>
                    setNewSubAdmin({ ...newSubAdmin, name: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newSubAdmin.email}
                  onChange={(e) =>
                    setNewSubAdmin({ ...newSubAdmin, email: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={newSubAdmin.password}
                  onChange={(e) =>
                    setNewSubAdmin({ ...newSubAdmin, password: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateSubAdmin(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#357AFF] text-white px-6 py-2 rounded-lg hover:bg-[#2E69DE] transition-colors"
                >
                  Create Sub-Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;