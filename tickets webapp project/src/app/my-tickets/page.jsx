"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading } = useUser();
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await fetch("/api/tickets/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to load your tickets");
    } finally {
      setLoadingTickets(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.venue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || ticket.payment_status === filterStatus;

    const eventDate = new Date(ticket.event_date);
    const now = new Date();
    const isUpcoming = eventDate > now;

    const matchesType =
      filterType === "all" ||
      (filterType === "upcoming" && isUpcoming) ||
      (filterType === "past" && !isUpcoming);

    return matchesSearch && matchesStatus && matchesType;
  });

  const generateQRCode = (ticketId) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TICKET-${ticketId}`;
  };

  const downloadTicket = (ticket) => {
    const ticketData = `
Event: ${ticket.event_title}
Date: ${new Date(ticket.event_date).toLocaleDateString()}
Venue: ${ticket.venue}
Ticket ID: ${ticket.id}
Quantity: ${ticket.quantity}
Total: $${ticket.total_amount}
    `.trim();

    const blob = new Blob([ticketData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${ticket.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-[#357AFF]">EventTix</h1>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href="/account/signin"
                  className="text-sm text-gray-600 hover:text-[#357AFF]"
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="bg-[#357AFF] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2E69DE]"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <i className="fas fa-lock text-gray-400 text-6xl mb-6"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-8">
              Please sign in to view your tickets and order history.
            </p>
            <a
              href="/account/signin?callbackUrl=/my-tickets"
              className="bg-[#357AFF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2E69DE] transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#357AFF]">EventTix</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-[#357AFF]">
                Home
              </a>
              <a href="/events" className="text-gray-600 hover:text-[#357AFF]">
                Events
              </a>
              <a
                href="/my-tickets"
                className="text-gray-900 hover:text-[#357AFF]"
              >
                My Tickets
              </a>
            </nav>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                Hello, {user.name || user.email}
              </span>
              <a
                href="/account/logout"
                className="text-sm text-gray-600 hover:text-[#357AFF]"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h2>
          <p className="text-gray-600">
            View and manage your purchased tickets and order history
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search events or venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 mr-3"></i>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loadingTickets ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-32 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="space-y-6">
            {filteredTickets.map((ticket) => {
              const eventDate = new Date(ticket.event_date);
              const isUpcoming = eventDate > new Date();
              const purchaseDate = new Date(ticket.purchase_date);

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="w-full lg:w-48 h-32 bg-gradient-to-r from-[#357AFF] to-[#2E69DE] rounded-lg flex items-center justify-center flex-shrink-0">
                        {ticket.event_image_url ? (
                          <img
                            src={ticket.event_image_url}
                            alt={ticket.event_title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <i className="fas fa-calendar-alt text-white text-3xl"></i>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {ticket.event_title}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <i className="fas fa-calendar mr-2"></i>
                              <span>
                                {eventDate.toLocaleDateString()} at{" "}
                                {eventDate.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-2">
                              <i className="fas fa-map-marker-alt mr-2"></i>
                              <span>{ticket.venue}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                                isUpcoming
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {isUpcoming ? "Upcoming" : "Past Event"}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                ticket.payment_status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : ticket.payment_status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ticket.payment_status === "completed"
                                ? "Paid"
                                : ticket.payment_status === "pending"
                                ? "Pending"
                                : "Failed"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Ticket ID</p>
                            <p className="font-medium">#{ticket.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="font-medium">
                              {ticket.quantity} ticket
                              {ticket.quantity > 1 ? "s" : ""}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Total Amount
                            </p>
                            <p className="font-medium text-[#357AFF]">
                              ${ticket.total_amount}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Purchase Date</p>
                          <p className="font-medium">
                            {purchaseDate.toLocaleDateString()} at{" "}
                            {purchaseDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {ticket.payment_status === "completed" && (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="bg-white p-2 rounded-lg border">
                            <img
                              src={generateQRCode(ticket.id)}
                              alt="QR Code for entry"
                              className="w-24 h-24"
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            QR Code for Entry
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => downloadTicket(ticket)}
                        className="flex items-center justify-center px-4 py-2 bg-[#357AFF] text-white rounded-lg hover:bg-[#2E69DE] transition-colors"
                      >
                        <i className="fas fa-download mr-2"></i>
                        Download Ticket
                      </button>
                      <a
                        href={`/events/${ticket.event_id}`}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-eye mr-2"></i>
                        View Event
                      </a>
                      {ticket.payment_status === "failed" && (
                        <button className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          <i className="fas fa-redo mr-2"></i>
                          Retry Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-ticket-alt text-gray-400 text-6xl mb-6"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "No tickets match your filters"
                : "No tickets found"}
            </h3>
            <p className="text-gray-500 mb-8">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You haven't purchased any tickets yet"}
            </p>
            <a
              href="/events"
              className="bg-[#357AFF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2E69DE] transition-colors"
            >
              Browse Events
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;