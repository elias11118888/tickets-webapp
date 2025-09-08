"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [hasExistingSuperAdmin, setHasExistingSuperAdmin] = useState(false);
  const [existingSuperAdmin, setExistingSuperAdmin] = useState(null);
  const [checkingSystem, setCheckingSystem] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

    if (!userLoading) {
      checkSystemStatus();
    }
  }, [userLoading]);

  const handleInitialize = async () => {
    if (!user) {
      setError("You must be logged in to initialize as super admin");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      console.log("Promoting current user to super admin:", {
        action: "promote",
        userId: user.id,
        name: user.name,
        email: user.email,
      });

      const response = await fetch("/api/setup-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "promote",
          userId: user.id,
          name: user.name,
          email: user.email,
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
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error promoting to super admin:", error);
      setError(
        error.message ||
          "Failed to initialize super admin. Check browser console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || checkingSystem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center max-w-md">
          <i className="fas fa-sign-in-alt text-red-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4">
            Sign In Required
          </h2>
          <p className="text-white/80 mb-6">
            You must be signed in to initialize as super administrator.
          </p>
          <a
            href="/account/signin"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // If system already has a super admin
  if (hasExistingSuperAdmin) {
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
            <a
              href="/"
              className="block bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors"
            >
              Go Home
            </a>
            <a
              href="/admin/signin"
              className="block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Admin Sign In
            </a>
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
            Initialization Complete!
          </h2>
          <p className="text-white/80 mb-6">
            You have been successfully promoted to super administrator. You can
            now access the super admin dashboard.
          </p>
          <a
            href="/super-admin"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors"
          >
            Go to Super Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Initialization form for current user
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md mx-4 border border-white/20">
        <div className="text-center mb-8">
          <i className="fas fa-crown text-yellow-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-2">
            Initialize Super Admin
          </h2>
          <p className="text-white/80 mb-4">
            Promote your current account to super administrator
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <p className="text-white/70 text-sm mb-1">Current Account:</p>
          <p className="text-white font-medium">{user.name}</p>
          <p className="text-white/80 text-sm">{user.email}</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            <span className="text-sm">
              This will promote your current account to super administrator with
              full system access.
            </span>
          </div>
        </div>

        <button
          onClick={handleInitialize}
          disabled={loading}
          className="w-full bg-[#357AFF] hover:bg-[#2E69DE] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Initializing...
            </div>
          ) : (
            "Initialize as Super Admin"
          )}
        </button>

        <div className="text-center">
          <a
            href="/"
            className="text-white/60 text-sm hover:text-white transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;