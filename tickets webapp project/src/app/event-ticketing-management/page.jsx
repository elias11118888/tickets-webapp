"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading } = useUser();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [selectedCategory]);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await fetch("/api/events/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory === "all" ? null : selectedCategory,
          status: "approved",
          limit: 6,
        }),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#357AFF]">EventTix</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-900 hover:text-[#357AFF]">
                Home
              </a>
              <a href="/events" className="text-gray-600 hover:text-[#357AFF]">
                Events
              </a>
              <a
                href="/categories"
                className="text-gray-600 hover:text-[#357AFF]"
              >
                Categories
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
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
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#357AFF] to-[#2E69DE] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Events
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Book tickets for the best events in your city
          </p>
          <a
            href="/events"
            className="bg-white text-[#357AFF] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Events
          </a>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#357AFF] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Events
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.name
                    ? "bg-[#357AFF] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">
            Featured Events
          </h3>

          {loadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-r from-[#357AFF] to-[#2E69DE] flex items-center justify-center">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-calendar-alt text-white text-4xl"></i>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-semibold text-gray-900">
                        {event.title}
                      </h4>
                      <span className="bg-[#357AFF] text-white px-2 py-1 rounded text-xs">
                        {event.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                      <span>
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {event.venue}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-[#357AFF]">
                          ${event.ticket_price}
                        </span>
                        <div className="text-sm text-gray-500">
                          {event.available_tickets} tickets left
                        </div>
                      </div>
                      <a
                        href={`/events/${event.id}`}
                        className="bg-[#357AFF] text-white px-4 py-2 rounded-lg hover:bg-[#2E69DE] transition-colors"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-calendar-times text-gray-400 text-6xl mb-4"></i>
              <h4 className="text-xl font-semibold text-gray-600 mb-2">
                No Events Found
              </h4>
              <p className="text-gray-500">Check back later for new events!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <a
              href="/events"
              className="bg-[#357AFF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2E69DE] transition-colors"
            >
              View All Events
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-xl font-bold mb-4">EventTix</h5>
              <p className="text-gray-400">
                Your premier destination for event tickets and experiences.
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Quick Links</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/events" className="hover:text-white">
                    Browse Events
                  </a>
                </li>
                <li>
                  <a href="/categories" className="hover:text-white">
                    Categories
                  </a>
                </li>
                <li>
                  <a href="/account/signin" className="hover:text-white">
                    Sign In
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Categories</h6>
              <ul className="space-y-2 text-gray-400">
                {categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <a
                      href={`/events?category=${category.name}`}
                      className="hover:text-white"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Contact</h6>
              <ul className="space-y-2 text-gray-400">
                <li>support@eventtix.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EventTix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainComponent;