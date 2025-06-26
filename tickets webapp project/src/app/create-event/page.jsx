"use client";
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [upload, { loading: uploading }] = useUpload();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    event_date: "",
    event_time: "",
    venue: "",
    ticket_price: "",
    total_tickets: "",
    image: null,
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!userLoading && user) {
      fetchCategories();
    }
  }, [user, userLoading]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Event title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Event description is required";
    }

    if (!formData.category) {
      errors.category = "Please select a category";
    }

    if (!formData.event_date) {
      errors.event_date = "Event date is required";
    }

    if (!formData.event_time) {
      errors.event_time = "Event time is required";
    }

    if (!formData.venue.trim()) {
      errors.venue = "Venue is required";
    }

    if (!formData.ticket_price || parseFloat(formData.ticket_price) < 0) {
      errors.ticket_price = "Valid ticket price is required";
    }

    if (!formData.total_tickets || parseInt(formData.total_tickets) < 1) {
      errors.total_tickets = "Total tickets must be at least 1";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const { url, error } = await upload({ file });
      if (error) {
        setError("Failed to upload image");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: url,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventDateTime = `${formData.event_date}T${formData.event_time}`;

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        event_date: eventDateTime,
        venue: formData.venue.trim(),
        ticket_price: parseFloat(formData.ticket_price),
        total_tickets: parseInt(formData.total_tickets),
        available_tickets: parseInt(formData.total_tickets),
        image_url: formData.image,
        status: "pending",
      };

      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create event: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/admin";
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setError(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#357AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-lock text-gray-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">Please sign in to create events</p>
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

  const isAdmin =
    user.email?.includes("admin") ||
    user.role === "admin" ||
    user.role === "sub-admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-shield text-gray-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Admin Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need admin privileges to create events
          </p>
          <a
            href="/"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE]"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Event Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your event has been submitted for approval and will be reviewed
            shortly.
          </p>
          <div className="w-8 h-8 border-4 border-[#357AFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a
                href="/admin"
                className="text-[#357AFF] hover:text-[#2E69DE] mr-4"
              >
                <i className="fas fa-arrow-left"></i>
              </a>
              <h1 className="text-2xl font-bold text-[#357AFF]">
                Create New Event
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name || user.email}
              </span>
              <a
                href="/admin"
                className="text-sm text-gray-600 hover:text-[#357AFF]"
              >
                Admin Dashboard
              </a>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Event Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill in the information below to create a new event
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <i className="fas fa-exclamation-circle text-red-600 mt-1 mr-3"></i>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Event Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] ${
                  validationErrors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter event title"
              />
              {validationErrors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Event Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Event Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] ${
                  validationErrors.description
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Describe your event in detail"
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.description}
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Event Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] ${
                  validationErrors.category
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.category}
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="event_date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Event Date *
                </label>
                <input
                  type="date"
                  id="event_date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] ${
                    validationErrors.event_date
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.event_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.event_date}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="event_time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Event Time *
                </label>
                <input
                  type="time"
                  id="event_time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] ${
                    validationErrors.event_time
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.event_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.event_time}
                  </p>
                )}
              </div>
            </div>

            {/* Venue */}
            <div>
              <label
                htmlFor="venue"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Venue *
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] ${
                  validationErrors.venue ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter venue name and address"
              />
              {validationErrors.venue && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.venue}
                </p>
              )}
            </div>

            {/* Pricing and Tickets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="ticket_price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ticket Price ($) *
                </label>
                <input
                  type="number"
                  id="ticket_price"
                  name="ticket_price"
                  value={formData.ticket_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] ${
                    validationErrors.ticket_price
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {validationErrors.ticket_price && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.ticket_price}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="total_tickets"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Total Tickets Available *
                </label>
                <input
                  type="number"
                  id="total_tickets"
                  name="total_tickets"
                  value={formData.total_tickets}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] ${
                    validationErrors.total_tickets
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="100"
                />
                {validationErrors.total_tickets && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.total_tickets}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {formData.image ? (
                  <div className="space-y-4">
                    <img
                      src={formData.image}
                      alt="Event preview"
                      className="mx-auto h-32 w-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: null }))
                      }
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-4"></i>
                    <p className="text-gray-600 mb-2">Upload an event image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {uploading ? "Uploading..." : "Choose File"}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <a
                href="/admin"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-[#357AFF] text-white rounded-lg hover:bg-[#2E69DE] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Creating Event...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;