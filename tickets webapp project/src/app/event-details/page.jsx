"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    paymentMethod: "credit_card",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId =
      urlParams.get("id") || window.location.pathname.split("/").pop();
    if (eventId && eventId !== "event-details") {
      fetchEvent(eventId);
      fetchCategories();
    } else {
      setError("Event ID not found");
      setLoading(false);
    }
  }, []);

  const fetchEvent = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch("/api/events/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: eventId }),
      });

      if (!response.ok) throw new Error("Failed to fetch event");
      const data = await response.json();

      if (data.events && data.events.length > 0) {
        setEvent(data.events[0]);
      } else {
        setError("Event not found");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      setError("Failed to load event details");
    } finally {
      setLoading(false);
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
      return <i className="fas fa-calendar-alt text-white text-8xl"></i>;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    if (!user) {
      window.location.href =
        "/account/signin?callbackUrl=" +
        encodeURIComponent(window.location.href);
      return;
    }

    setPurchaseLoading(true);

    try {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          quantity: ticketQuantity,
          buyerName: formData.fullName,
          buyerEmail: formData.email,
          buyerPhone: formData.phone,
          paymentMethod: formData.paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Purchase failed");
      }

      const result = await response.json();

      if (result.success) {
        setPurchaseSuccess(true);
        setShowPurchaseForm(false);

        // Update event availability
        setEvent((prev) => ({
          ...prev,
          available_tickets: result.event.remainingTickets,
        }));
      } else {
        throw new Error(result.error || "Purchase failed");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setError(error.message || "Purchase failed. Please try again.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const totalPrice = event ? event.ticket_price * ticketQuantity : 0;
  const maxQuantity = event ? Math.min(10, event.available_tickets) : 1;

  if (loading) {
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
                <a
                  href="/events"
                  className="text-gray-600 hover:text-[#357AFF]"
                >
                  Events
                </a>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
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
                <a
                  href="/events"
                  className="text-gray-600 hover:text-[#357AFF]"
                >
                  Events
                </a>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <i className="fas fa-exclamation-triangle text-gray-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <a
            href="/events"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE]"
          >
            Browse Events
          </a>
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
                href="/categories"
                className="text-gray-600 hover:text-[#357AFF]"
              >
                Categories
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              {userLoading ? (
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
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-[#357AFF]">
            Home
          </a>
          <i className="fas fa-chevron-right text-xs"></i>
          <a href="/events" className="hover:text-[#357AFF]">
            Events
          </a>
          <i className="fas fa-chevron-right text-xs"></i>
          <span className="text-gray-900">{event.title}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-96 bg-gradient-to-r from-[#357AFF] to-[#2E69DE] flex items-center justify-center">
            {renderEventMedia(event)}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h1>
                    <span className="bg-[#357AFF] text-white px-3 py-1 rounded-full text-sm">
                      {event.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#357AFF]">
                      ${event.ticket_price}
                    </div>
                    <div className="text-sm text-gray-500">per ticket</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#357AFF] rounded-full flex items-center justify-center">
                      <i className="fas fa-calendar text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Date & Time
                      </div>
                      <div className="text-gray-600">
                        {new Date(event.event_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-gray-600">
                        {new Date(event.event_date).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#357AFF] rounded-full flex items-center justify-center">
                      <i className="fas fa-map-marker-alt text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Venue</div>
                      <div className="text-gray-600">{event.venue}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#357AFF] rounded-full flex items-center justify-center">
                      <i className="fas fa-ticket-alt text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Availability
                      </div>
                      <div className="text-gray-600">
                        {event.available_tickets} tickets remaining
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#357AFF] rounded-full flex items-center justify-center">
                      <i className="fas fa-info-circle text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Status</div>
                      <div
                        className={`text-sm px-2 py-1 rounded ${
                          event.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : event.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {event.status.charAt(0).toUpperCase() +
                          event.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About This Event
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                  {purchaseSuccess ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check text-green-600 text-2xl"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Purchase Successful!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your tickets have been confirmed. Check your email for
                        details.
                      </p>
                      <a
                        href="/events"
                        className="bg-[#357AFF] text-white px-6 py-2 rounded-lg hover:bg-[#2E69DE] transition-colors"
                      >
                        Browse More Events
                      </a>
                    </div>
                  ) : event.available_tickets === 0 ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-times text-red-600 text-2xl"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Sold Out
                      </h3>
                      <p className="text-gray-600">
                        This event is currently sold out.
                      </p>
                    </div>
                  ) : event.status !== "approved" ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-clock text-yellow-600 text-2xl"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Event Pending
                      </h3>
                      <p className="text-gray-600">
                        This event is pending approval and tickets are not yet
                        available.
                      </p>
                    </div>
                  ) : !showPurchaseForm ? (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Purchase Tickets
                      </h3>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <select
                          value={ticketQuantity}
                          onChange={(e) =>
                            setTicketQuantity(parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                        >
                          {Array.from(
                            { length: maxQuantity },
                            (_, i) => i + 1
                          ).map((num) => (
                            <option key={num} value={num}>
                              {num} ticket{num > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Ticket Price</span>
                          <span className="font-semibold">
                            ${event.ticket_price}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Quantity</span>
                          <span className="font-semibold">
                            {ticketQuantity}
                          </span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-lg font-bold text-[#357AFF]">
                              ${totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowPurchaseForm(true)}
                        className="w-full bg-[#357AFF] text-white py-3 rounded-lg font-semibold hover:bg-[#2E69DE] transition-colors"
                      >
                        Buy Tickets
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePurchase}>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Buyer Information
                      </h3>

                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method *
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="credit_card"
                                checked={
                                  formData.paymentMethod === "credit_card"
                                }
                                onChange={handleInputChange}
                                className="mr-3"
                              />
                              <i className="fas fa-credit-card mr-3 text-[#357AFF]"></i>
                              <div>
                                <div className="font-medium">
                                  Credit/Debit Card
                                </div>
                                <div className="text-sm text-gray-500">
                                  Visa, Mastercard, American Express
                                </div>
                              </div>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="mobile_money"
                                checked={
                                  formData.paymentMethod === "mobile_money"
                                }
                                onChange={handleInputChange}
                                className="mr-3"
                              />
                              <i className="fas fa-mobile-alt mr-3 text-[#357AFF]"></i>
                              <div>
                                <div className="font-medium">Mobile Money</div>
                                <div className="text-sm text-gray-500">
                                  M-Pesa, Airtel Money, MTN Mobile Money
                                </div>
                              </div>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="paypal"
                                checked={formData.paymentMethod === "paypal"}
                                onChange={handleInputChange}
                                className="mr-3"
                              />
                              <i className="fab fa-paypal mr-3 text-[#357AFF]"></i>
                              <div>
                                <div className="font-medium">PayPal</div>
                                <div className="text-sm text-gray-500">
                                  Pay with your PayPal account
                                </div>
                              </div>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="bank_transfer"
                                checked={
                                  formData.paymentMethod === "bank_transfer"
                                }
                                onChange={handleInputChange}
                                className="mr-3"
                              />
                              <i className="fas fa-university mr-3 text-[#357AFF]"></i>
                              <div>
                                <div className="font-medium">Bank Transfer</div>
                                <div className="text-sm text-gray-500">
                                  Direct bank account transfer
                                </div>
                              </div>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="crypto"
                                checked={formData.paymentMethod === "crypto"}
                                onChange={handleInputChange}
                                className="mr-3"
                              />
                              <i className="fab fa-bitcoin mr-3 text-[#357AFF]"></i>
                              <div>
                                <div className="font-medium">
                                  Cryptocurrency
                                </div>
                                <div className="text-sm text-gray-500">
                                  Bitcoin, Ethereum, USDC
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="text-lg font-bold text-[#357AFF]">
                            ${totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {ticketQuantity} ticket{ticketQuantity > 1 ? "s" : ""}{" "}
                          × ${event.ticket_price}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowPurchaseForm(false)}
                          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={purchaseLoading}
                          className="flex-1 bg-[#357AFF] text-white py-3 rounded-lg font-semibold hover:bg-[#2E69DE] transition-colors disabled:opacity-50"
                        >
                          {purchaseLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            "Complete Purchase"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-16">
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
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-400">
                <li>support@eventtix.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Follow Us</h6>
              <div className="flex space-x-4">
                <i className="fab fa-facebook text-gray-400 hover:text-white cursor-pointer"></i>
                <i className="fab fa-twitter text-gray-400 hover:text-white cursor-pointer"></i>
                <i className="fab fa-instagram text-gray-400 hover:text-white cursor-pointer"></i>
              </div>
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