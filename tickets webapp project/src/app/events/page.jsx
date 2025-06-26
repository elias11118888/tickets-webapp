"use client";
import React from "react";

function MainComponent() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const eventsPerPage = 12;

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 100 }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch events: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const approvedEvents =
        data.events?.filter((event) => event.status === "approved") || [];
      setEvents(approvedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getCategoryMedia = (category) => {
    const categoryData = categories.find((cat) => cat.name === category);
    return categoryData || null;
  };

  const renderEventMedia = (event) => {
    const categoryData = getCategoryMedia(event.category);

    if (categoryData && categoryData.image_url) {
      if (categoryData.media_type === "video") {
        return (
          <video
            src={categoryData.image_url}
            className="w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
          />
        );
      } else {
        return (
          <img
            src={categoryData.image_url}
            alt={event.category}
            className="w-full h-full object-cover"
          />
        );
      }
    } else {
      return <i className="fas fa-calendar-alt text-white text-4xl"></i>;
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.event_date) - new Date(b.event_date);
      case "price-low":
        return (a.ticket_price || 0) - (b.ticket_price || 0);
      case "price-high":
        return (b.ticket_price || 0) - (a.ticket_price || 0);
      case "title":
        return (a.title || "").localeCompare(b.title || "");
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = sortedEvents.slice(
    startIndex,
    startIndex + eventsPerPage
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#357AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-roboto">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 font-roboto mb-4">
              Discover Amazing Events
            </h1>
            <p className="text-xl text-gray-600 font-roboto max-w-2xl mx-auto">
              Find and book tickets for concerts, conferences, workshops, and
              more
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search events, venues, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent font-roboto"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full lg:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent font-roboto"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="w-full lg:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full lg:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent font-roboto"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 font-roboto">
            <p>
              Showing {paginatedEvents.length} of {filteredEvents.length} events
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setCurrentPage(1);
                }}
                className="mt-2 sm:mt-0 text-[#357AFF] hover:text-[#2E69DE] flex items-center"
              >
                <i className="fas fa-times mr-1"></i>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-600 mr-3"></i>
              <p className="text-red-700 font-roboto">{error}</p>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {paginatedEvents.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-calendar-times text-gray-400 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 font-roboto mb-2">
              No events found
            </h3>
            <p className="text-gray-600 font-roboto mb-4">
              {searchTerm || selectedCategory
                ? "Try adjusting your search or filter criteria"
                : "Check back later for upcoming events"}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setCurrentPage(1);
                }}
                className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] font-roboto"
              >
                View All Events
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Event Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-[#357AFF] to-[#2E69DE] flex items-center justify-center">
                  {renderEventMedia(event)}
                </div>

                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-[#357AFF] text-xs font-medium px-2 py-1 rounded-full font-roboto">
                      {event.category}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h3 className="text-lg font-semibold text-gray-900 font-roboto mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p className="text-gray-600 text-sm font-roboto mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 font-roboto">
                      <i className="fas fa-calendar-alt w-4 mr-2 text-gray-400"></i>
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 font-roboto">
                      <i className="fas fa-clock w-4 mr-2 text-gray-400"></i>
                      <span>{formatTime(event.event_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 font-roboto">
                      <i className="fas fa-map-marker-alt w-4 mr-2 text-gray-400"></i>
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </div>

                  {/* Pricing and Availability */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-[#357AFF] font-roboto">
                        ${event.ticket_price}
                      </span>
                      <span className="text-sm text-gray-600 font-roboto ml-1">
                        per ticket
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 font-roboto">
                        {event.available_tickets} left
                      </div>
                      <div className="text-xs text-gray-500 font-roboto">
                        of {event.total_tickets} total
                      </div>
                    </div>
                  </div>

                  {/* Availability Status */}
                  <div className="mb-4">
                    {event.available_tickets > 0 ? (
                      <div className="flex items-center text-green-600 text-sm font-roboto">
                        <i className="fas fa-check-circle mr-2"></i>
                        <span>Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 text-sm font-roboto">
                        <i className="fas fa-times-circle mr-2"></i>
                        <span>Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <a
                    href={`/event-details?id=${event.id}`}
                    className={`w-full py-3 px-4 rounded-lg font-medium font-roboto transition-colors duration-200 text-center block ${
                      event.available_tickets > 0
                        ? "bg-[#357AFF] text-white hover:bg-[#2E69DE]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {event.available_tickets > 0 ? (
                      <>
                        <i className="fas fa-ticket-alt mr-2"></i>
                        View Details & Buy Tickets
                      </>
                    ) : (
                      <>
                        <i className="fas fa-ban mr-2"></i>
                        Sold Out
                      </>
                    )}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-roboto ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <i className="fas fa-chevron-left mr-2"></i>
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-roboto ${
                      currentPage === pageNum
                        ? "bg-[#357AFF] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-roboto ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Next
              <i className="fas fa-chevron-right ml-2"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;