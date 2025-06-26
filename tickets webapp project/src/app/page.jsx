"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading } = useUser();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        <div className="geometric-shape shape-1"></div>
        <div className="geometric-shape shape-2"></div>
        <div className="geometric-shape shape-3"></div>
        <div className="geometric-shape shape-4"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">EventTix</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="/"
                className="text-white hover:text-[#357AFF] transition-colors"
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
              {loading ? (
                <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-white/90">
                    Hello, {user.name || user.email}
                  </span>
                  <a
                    href="/account/logout"
                    className="text-sm text-white/80 hover:text-[#357AFF] transition-colors"
                  >
                    Logout
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <a
                    href="/account/signin"
                    className="text-sm text-white/80 hover:text-[#357AFF] transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="/account/signup"
                    className="bg-[#357AFF] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2E69DE] transition-colors"
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
      <section className="relative z-10 flex items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Discover
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#357AFF] to-[#00D4FF]">
              {" "}
              Amazing{" "}
            </span>
            Events
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Book tickets for the best concerts, festivals, conferences, and
            experiences in your city. Join thousands of event-goers discovering
            unforgettable moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/events"
              className="bg-gradient-to-r from-[#357AFF] to-[#2E69DE] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-[#2E69DE] hover:to-[#357AFF] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Browse Events
            </a>
            <a
              href="/admin"
              className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              Create Event
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Why Choose EventTix?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-[#357AFF] text-4xl mb-4">
                <i className="fas fa-ticket-alt"></i>
              </div>
              <h4 className="text-xl font-semibold text-white mb-4">
                Easy Booking
              </h4>
              <p className="text-white/70">
                Simple and secure ticket booking process with instant
                confirmation and digital tickets.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-[#357AFF] text-4xl mb-4">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h4 className="text-xl font-semibold text-white mb-4">
                Diverse Events
              </h4>
              <p className="text-white/70">
                From concerts to conferences, discover events across multiple
                categories and interests.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-[#357AFF] text-4xl mb-4">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4 className="text-xl font-semibold text-white mb-4">
                Secure Platform
              </h4>
              <p className="text-white/70">
                Your personal information and payments are protected with
                industry-standard security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      {categories.length > 0 && (
        <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Explore Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <a
                  key={category.id}
                  href={`/events?category=${category.name}`}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
                >
                  <h4 className="text-lg font-semibold text-white">
                    {category.name}
                  </h4>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-xl font-bold text-white mb-4">EventTix</h5>
              <p className="text-white/70">
                Your premier destination for event tickets and experiences.
              </p>
            </div>
            <div>
              <h6 className="font-semibold text-white mb-4">Quick Links</h6>
              <ul className="space-y-2 text-white/70">
                <li>
                  <a
                    href="/events"
                    className="hover:text-[#357AFF] transition-colors"
                  >
                    Browse Events
                  </a>
                </li>
                <li>
                  <a
                    href="/admin"
                    className="hover:text-[#357AFF] transition-colors"
                  >
                    Admin Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/account/signin"
                    className="hover:text-[#357AFF] transition-colors"
                  >
                    Sign In
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold text-white mb-4">Categories</h6>
              <ul className="space-y-2 text-white/70">
                {categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <a
                      href={`/events?category=${category.name}`}
                      className="hover:text-[#357AFF] transition-colors"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h6 className="font-semibold text-white mb-4">Contact</h6>
              <ul className="space-y-2 text-white/70">
                <li>support@eventtix.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2025 EventTix. All rights reserved.</p>
          </div>
        </div>
      </footer>

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

        .particle-4 {
          width: 5px;
          height: 5px;
          top: 80%;
          left: 60%;
          animation-delay: -15s;
          animation-duration: 28s;
        }

        .particle-5 {
          width: 4px;
          height: 4px;
          top: 30%;
          left: 90%;
          animation-delay: -20s;
          animation-duration: 32s;
        }

        .particle-6 {
          width: 7px;
          height: 7px;
          top: 70%;
          left: 30%;
          animation-delay: -25s;
          animation-duration: 26s;
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

        .shape-3 {
          width: 80px;
          height: 80px;
          top: 45%;
          right: 25%;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          background: rgba(53, 122, 255, 0.1);
          animation-delay: -20s;
          animation-duration: 45s;
        }

        .shape-4 {
          width: 50px;
          height: 50px;
          top: 25%;
          left: 40%;
          transform: rotate(30deg);
          animation-delay: -30s;
          animation-duration: 38s;
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