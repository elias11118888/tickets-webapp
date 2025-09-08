"use client";
import React from "react";

function MainComponent() {
  const [hasExistingSuperAdmin, setHasExistingSuperAdmin] = useState(false);
  const [existingSuperAdmin, setExistingSuperAdmin] = useState(null);
  const [checkingSystem, setCheckingSystem] = useState(true);
  const [setupData, setSetupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  // Check if system already has a super admin
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Check if any super admin exists in the system
        const checkResponse = await fetch("/api/setup-super-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check" }),
        });

        if (!checkResponse.ok) {
          throw new Error(`HTTP error! status: ${checkResponse.status}`);
        }

        const checkData = await checkResponse.json();

        if (checkData.error) {
          console.error("API Error:", checkData.error);
          setError(checkData.error);
        } else if (checkData.hasSuperAdmin) {
          setHasExistingSuperAdmin(true);
          setExistingSuperAdmin(checkData.existingSuperAdmin);
        }
      } catch (error) {
        console.error("Error checking system status:", error);
        setError("Failed to check system status. Please try again.");
      } finally {
        setCheckingSystem(false);
      }
    };

    checkSystemStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (setupData.password !== setupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (setupData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting setup data:", {
        action: "create",
        name: setupData.name,
        email: setupData.email,
        forceOverride: hasExistingSuperAdmin,
      });

      const response = await fetch("/api/setup-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: setupData.name,
          email: setupData.email,
          password: setupData.password,
          forceOverride: hasExistingSuperAdmin,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      if (responseData.success) {
        setSuccess(true);
        setSetupData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error setting up super admin:", error);
      setError(
        error.message ||
          "Failed to setup super admin. Check browser console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSetupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (checkingSystem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If system already has a super admin but user hasn't chosen to override
  if (hasExistingSuperAdmin && !showOverrideForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center max-w-md">
          <i className="fas fa-shield-alt text-orange-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4">
            System Already Initialized
          </h2>
          <p className="text-white/80 mb-4">
            A super administrator has already been set up for this system.
          </p>
          {existingSuperAdmin && (
            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
              <p className="text-white/70 text-sm mb-1">Current Super Admin:</p>
              <p className="text-white font-medium">
                {existingSuperAdmin.name}
              </p>
              <p className="text-white/80 text-sm">
                {existingSuperAdmin.email}
              </p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => setShowOverrideForm(true)}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Replace Super Admin
            </button>
            <div className="flex space-x-3">
              <a
                href="/"
                className="flex-1 bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors text-center"
              >
                Go Home
              </a>
              <a
                href="/admin/signin"
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Admin Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center max-w-md">
          <i className="fas fa-check-circle text-green-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4">
            {hasExistingSuperAdmin
              ? "Super Admin Replaced!"
              : "Setup Complete!"}
          </h2>
          <p className="text-white/80 mb-6">
            Super administrator account has been{" "}
            {hasExistingSuperAdmin ? "replaced" : "created"} successfully. You
            can now sign in with your credentials.
          </p>
          <a
            href="/admin/signin"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors"
          >
            Sign In as Admin
          </a>
        </div>
      </div>
    );
  }

  // Setup form (either initial setup or override form)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md mx-4 border border-white/20">
        <div className="text-center mb-8">
          <i
            className={`fas ${
              hasExistingSuperAdmin
                ? "fa-user-shield text-red-400"
                : "fa-crown text-yellow-400"
            } text-6xl mb-4`}
          ></i>
          <h2 className="text-2xl font-bold text-white mb-2">
            {hasExistingSuperAdmin
              ? "Replace Super Admin"
              : "Initialize Super Admin"}
          </h2>
          <p className="text-white/80">
            {hasExistingSuperAdmin
              ? "This will replace the existing super administrator"
              : "Set up the first super administrator for EventTix"}
          </p>
        </div>

        {hasExistingSuperAdmin && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              <span className="text-sm">
                Warning: This will deactivate the current super admin account.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={setupData.name}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={setupData.email}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={setupData.password}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
              placeholder="Create a strong password"
              required
              minLength="6"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={setupData.confirmPassword}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
              placeholder="Confirm your password"
              required
              minLength="6"
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                hasExistingSuperAdmin
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#357AFF] hover:bg-[#2E69DE]"
              } text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {hasExistingSuperAdmin ? "Replacing..." : "Setting up..."}
                </div>
              ) : hasExistingSuperAdmin ? (
                "Replace Super Admin"
              ) : (
                "Initialize Super Admin"
              )}
            </button>

            {hasExistingSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowOverrideForm(false)}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            {hasExistingSuperAdmin
              ? "This will create a new super administrator and deactivate the current one."
              : "This will create the first super administrator account for the system."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;