"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading } = useUser();
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    venue: "",
    event_date: "",
    event_time: "",
    ticket_price: "",
    total_tickets: "",
    image_url: "",
  });

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    if (activeTab === "analytics") {
      fetchSalesData();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await fetch("/api/events/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_only: true }),
      });

      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
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

  const fetchSalesData = async () => {
    try {
      setLoadingSales(true);
      const response = await fetch("/api/sales/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_view: true }),
      });

      if (!response.ok) throw new Error("Failed to fetch sales data");
      const data = await response.json();
      setSalesData(data.sales || []);
      setRevenueData(data.revenue || {});
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create event");

      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        venue: "",
        event_date: "",
        event_time: "",
        ticket_price: "",
        total_tickets: "",
        image_url: "",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleUpdateEventStatus = async (eventId, status) => {
    try {
      const response = await fetch("/api/events/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, status }),
      });

      if (!response.ok) throw new Error("Failed to update event status");
      fetchEvents();
    } catch (error) {
      console.error("Error updating event status:", error);
    }
  };

  const totalRevenue = revenueData.total_revenue || 0;
  const totalCommission = revenueData.commission || 0;
  const totalTicketsSold = salesData.reduce(
    (sum, sale) => sum + (sale.tickets_sold || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="geometric-shape shape-1"></div>
        <div className="geometric-shape shape-2"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                Sub-Admin Dashboard
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
                className="text-white hover:text-[#357AFF] transition-colors"
              >
                Admin
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-white/90">
                    {user.name || user.email}
                  </span>
                  <a
                    href="/account/logout"
                    className="text-sm text-white/80 hover:text-[#357AFF] transition-colors"
                  >
                    Logout
                  </a>
                </div>
              ) : (
                <a
                  href="/account/signin"
                  className="bg-[#357AFF] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2E69DE] transition-colors"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 mb-8 border border-white/20">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === "events"
                  ? "bg-[#357AFF] text-white shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              Event Management
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === "analytics"
                  ? "bg-[#357AFF] text-white shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Sales Analytics
            </button>
            <button
              onClick={() => setActiveTab("revenue")}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === "revenue"
                  ? "bg-[#357AFF] text-white shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <i className="fas fa-dollar-sign mr-2"></i>
              Revenue Tracking
            </button>
          </div>
        </div>

        {/* Event Management Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            {/* Create Event Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">My Events</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#357AFF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2E69DE] transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Event
              </button>
            </div>

            {/* Events Grid */}
            {loadingEvents ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 animate-pulse"
                  >
                    <div className="h-4 bg-white/20 rounded mb-4"></div>
                    <div className="h-3 bg-white/20 rounded mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        {event.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.status === "approved"
                            ? "bg-green-500 text-white"
                            : event.status === "pending"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-white/80 mb-4">
                      <div>
                        <i className="fas fa-calendar mr-2"></i>
                        {new Date(event.event_date).toLocaleDateString()}
                      </div>
                      <div>
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {event.venue}
                      </div>
                      <div>
                        <i className="fas fa-tag mr-2"></i>${event.ticket_price}
                      </div>
                      <div>
                        <i className="fas fa-ticket-alt mr-2"></i>
                        {event.available_tickets} / {event.total_tickets}{" "}
                        available
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="flex-1 bg-white/20 text-white px-3 py-2 rounded text-sm hover:bg-white/30 transition-colors"
                      >
                        Edit
                      </button>
                      {event.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateEventStatus(event.id, "approved")
                            }
                            className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateEventStatus(event.id, "rejected")
                            }
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sales Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Sales Analytics</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Tickets Sold</p>
                    <p className="text-2xl font-bold text-white">
                      {totalTicketsSold}
                    </p>
                  </div>
                  <i className="fas fa-ticket-alt text-[#357AFF] text-2xl"></i>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      ${totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <i className="fas fa-dollar-sign text-green-400 text-2xl"></i>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Active Events</p>
                    <p className="text-2xl font-bold text-white">
                      {events.filter((e) => e.status === "approved").length}
                    </p>
                  </div>
                  <i className="fas fa-calendar-check text-yellow-400 text-2xl"></i>
                </div>
              </div>
            </div>

            {/* Sales Data Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white">
                  Event Performance
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Tickets Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {events.map((event) => {
                      const soldTickets =
                        event.total_tickets - event.available_tickets;
                      const eventRevenue = soldTickets * event.ticket_price;
                      return (
                        <tr key={event.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {event.title}
                            </div>
                            <div className="text-sm text-white/70">
                              {event.venue}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {soldTickets} / {event.total_tickets}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            ${eventRevenue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                event.status === "approved"
                                  ? "bg-green-500 text-white"
                                  : event.status === "pending"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {event.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tracking Tab */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Revenue Tracking</h2>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Revenue Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Gross Revenue</span>
                    <span className="text-white font-semibold">
                      ${totalRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Commission (10%)</span>
                    <span className="text-white font-semibold">
                      ${totalCommission.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">
                        Net Earnings
                      </span>
                      <span className="text-white font-bold text-lg">
                        ${(totalRevenue - totalCommission).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Average Ticket Price</span>
                    <span className="text-white font-semibold">
                      $
                      {events.length > 0
                        ? (
                            events.reduce(
                              (sum, e) => sum + parseFloat(e.ticket_price),
                              0
                            ) / events.length
                          ).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Conversion Rate</span>
                    <span className="text-white font-semibold">
                      {events.length > 0
                        ? (
                            (totalTicketsSold /
                              events.reduce(
                                (sum, e) => sum + e.total_tickets,
                                0
                              )) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Revenue per Event</span>
                    <span className="text-white font-semibold">
                      $
                      {events.length > 0
                        ? (totalRevenue / events.length).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Create New Event
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-white/70 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.name}
                        className="bg-gray-800"
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Event Time
                  </label>
                  <input
                    type="time"
                    name="event_time"
                    value={formData.event_time}
                    onChange={(e) =>
                      setFormData({ ...formData, event_time: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Ticket Price ($)
                  </label>
                  <input
                    type="number"
                    name="ticket_price"
                    value={formData.ticket_price}
                    onChange={(e) =>
                      setFormData({ ...formData, ticket_price: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Total Tickets
                  </label>
                  <input
                    type="number"
                    name="total_tickets"
                    value={formData.total_tickets}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_tickets: e.target.value,
                      })
                    }
                    min="1"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#357AFF] text-white py-3 rounded-lg font-semibold hover:bg-[#2E69DE] transition-colors"
                >
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-white/20 text-white py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .particle {
          position: absolute;
          background: rgba(53, 122, 255, 0.3);
          border-radius: 50%;
          animation: float 20s infinite linear;
        }

        .particle-1 {
          width: 4px;
          height: 4px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 25s;
        }

        .particle-2 {
          width: 6px;
          height: 6px;
          top: 60%;
          left: 80%;
          animation-delay: -5s;
          animation-duration: 30s;
        }

        .particle-3 {
          width: 3px;
          height: 3px;
          top: 40%;
          left: 20%;
          animation-delay: -10s;
          animation-duration: 35s;
        }

        .geometric-shape {
          position: absolute;
          border: 1px solid rgba(53, 122, 255, 0.2);
          animation: rotate 40s infinite linear;
        }

        .shape-1 {
          width: 60px;
          height: 60px;
          top: 15%;
          right: 15%;
          transform: rotate(45deg);
          animation-delay: 0s;
        }

        .shape-2 {
          width: 40px;
          height: 40px;
          top: 70%;
          left: 15%;
          border-radius: 50%;
          animation-delay: -10s;
          animation-duration: 50s;
        }

        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default MainComponent;