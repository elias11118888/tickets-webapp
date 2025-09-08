"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading } = useUser();
  const [dashboardData, setDashboardData] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    recentActivities: [],
    salesData: [],
    subAdmins: [],
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState("7");
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user && user.role === "super_admin") {
      fetchDashboardData();
    }
  }, [user, selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      const response = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeRange: selectedTimeRange }),
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
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/10 backdrop-blur-md min-h-screen border-r border-white/20">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white mb-8">Super Admin</h1>
            <nav className="space-y-4">
              <a
                href="/admin/dashboard"
                className="flex items-center text-white/90 hover:text-white py-2 px-4 rounded-lg bg-white/10"
              >
                <i className="fas fa-chart-line w-6"></i>
                <span>Dashboard</span>
              </a>
              <a
                href="/admin/events"
                className="flex items-center text-white/70 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10"
              >
                <i className="fas fa-calendar-alt w-6"></i>
                <span>Events</span>
              </a>
              <a
                href="/admin/categories"
                className="flex items-center text-white/70 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10"
              >
                <i className="fas fa-tags w-6"></i>
                <span>Categories</span>
              </a>
              <a
                href="/admin/users"
                className="flex items-center text-white/70 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10"
              >
                <i className="fas fa-users w-6"></i>
                <span>Users</span>
              </a>
              <a
                href="/admin/reports"
                className="flex items-center text-white/70 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10"
              >
                <i className="fas fa-chart-bar w-6"></i>
                <span>Reports</span>
              </a>
              <a
                href="/admin/settings"
                className="flex items-center text-white/70 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10"
              >
                <i className="fas fa-cog w-6"></i>
                <span>Settings</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Dashboard Overview
              </h2>
              <p className="text-white/70">
                Welcome back, {user.name || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg px-4 py-2"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <a
                href="/account/logout"
                className="text-white/80 hover:text-white"
              >
                <i className="fas fa-sign-out-alt"></i>
              </a>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70">Total Events</p>
                  <p className="text-3xl font-bold text-white">
                    {dashboardData.totalEvents}
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <i className="fas fa-calendar text-blue-400 text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">
                    ${dashboardData.totalRevenue?.toLocaleString()}
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
                  <p className="text-white/70">Tickets Sold</p>
                  <p className="text-3xl font-bold text-white">
                    {dashboardData.totalTicketsSold?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <i className="fas fa-ticket-alt text-purple-400 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Chart and Activity Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">
                Real-time Sales
              </h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {dashboardData.salesData?.map((data, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-gradient-to-t from-[#357AFF] to-[#00D4FF] rounded-t w-8"
                      style={{
                        height: `${
                          (data.amount /
                            Math.max(
                              ...dashboardData.salesData.map((d) => d.amount)
                            )) *
                          200
                        }px`,
                      }}
                    ></div>
                    <span className="text-white/70 text-xs mt-2">
                      {data.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {dashboardData.recentActivities?.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 text-white/70"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#357AFF]"></div>
                    <p className="flex-1">{activity.description}</p>
                    <span className="text-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="/create-event"
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-plus-circle text-[#357AFF] text-2xl mb-4"></i>
              <h4 className="text-white font-semibold">Create Event</h4>
              <p className="text-white/70 text-sm mt-2">
                Add a new event to the platform
              </p>
            </a>
            <a
              href="/admin/categories"
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-folder-plus text-[#357AFF] text-2xl mb-4"></i>
              <h4 className="text-white font-semibold">Manage Categories</h4>
              <p className="text-white/70 text-sm mt-2">
                Update event categories
              </p>
            </a>
            <a
              href="/admin/users"
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-user-shield text-[#357AFF] text-2xl mb-4"></i>
              <h4 className="text-white font-semibold">User Management</h4>
              <p className="text-white/70 text-sm mt-2">Manage user accounts</p>
            </a>
            <a
              href="/admin/reports"
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-chart-pie text-[#357AFF] text-2xl mb-4"></i>
              <h4 className="text-white font-semibold">Analytics</h4>
              <p className="text-white/70 text-sm mt-2">
                View detailed reports
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;