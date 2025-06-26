"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  useEffect(() => {
    if (userRole) {
      fetchEvents();
      fetchCategories();
    }
  }, [selectedCategory, userRole]);

  const checkUserRole = async () => {
    try {
      setLoadingRole(true);
      const response = await fetch("/api/admin/check-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Failed to check role");
      const data = await response.json();

      if (data.role) {
        setUserRole(data.role);

        // Redirect to appropriate dashboard
        if (data.role === "super_admin") {
          window.location.href = "/admin/dashboard";
          return;
        } else if (data.role === "sub_admin") {
          window.location.href = "/admin/sub-admin";
          return;
        }
      } else {
        // Not an admin, show access denied
        setUserRole("denied");
      }
    } catch (error) {
      console.error("Error checking role:", error);
      setUserRole("denied");
    } finally {
      setLoadingRole(false);
    }
  };

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
    } else if (event.image_url) {
      return (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      );
    } else {
      return <i className="fas fa-calendar-alt text-white text-4xl"></i>;
    }
  };

  if (loading || loadingRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#357AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-sign-in-alt text-gray-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-500 mb-6">
            Please sign in to access the admin dashboard.
          </p>
          <a
            href="/account/signin?callbackUrl=/admin"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (userRole === "denied") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-shield-alt text-red-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-500 mb-6">
            You don't have permission to access the admin dashboard.
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

  // This should not be reached as users are redirected above, but keeping as fallback
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#357AFF]">
                EventTix Admin
              </h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#357AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;