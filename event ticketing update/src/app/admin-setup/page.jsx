"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [setupStatus, setSetupStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleSetup = async () => {
    try {
      setSetupStatus("loading");
      setError(null);

      const response = await fetch("/api/admin/setup-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to setup super admin");
      }

      setSetupStatus("success");
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 2000);
    } catch (error) {
      console.error("Setup error:", error);
      setError(error.message);
      setSetupStatus("error");
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center max-w-md w-full mx-4">
          <i className="fas fa-lock text-red-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/80 mb-6">
            Please sign in with your admin account to continue
          </p>
          <a
            href="/account/signin"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors inline-block"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!user.email?.includes("admin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center max-w-md w-full mx-4">
          <i className="fas fa-user-shield text-red-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4">
            Invalid Admin Account
          </h2>
          <p className="text-white/80 mb-6">
            Please sign in with a valid admin account to continue
          </p>
          <div className="space-y-3">
            <a
              href="/account/logout"
              className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors inline-block w-full"
            >
              Sign Out
            </a>
            <a
              href="/account/signin"
              className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors inline-block w-full"
            >
              Sign In as Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center max-w-md w-full mx-4">
        <i className="fas fa-user-cog text-[#357AFF] text-6xl mb-4"></i>
        <h2 className="text-2xl font-bold text-white mb-4">
          Super Admin Setup
        </h2>
        <p className="text-white/80 mb-6">
          Initialize super admin access for your account
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {setupStatus === "success" ? (
          <div className="text-center">
            <i className="fas fa-check-circle text-green-400 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-white mb-2">
              Setup Complete!
            </h3>
            <p className="text-white/80 mb-4">
              Redirecting to super admin dashboard...
            </p>
            <div className="w-8 h-8 border-4 border-[#357AFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <button
            onClick={handleSetup}
            disabled={setupStatus === "loading"}
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {setupStatus === "loading" ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Setting up...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                Initialize Super Admin
              </>
            )}
          </button>
        )}

        <div className="mt-6 text-white/60 text-sm">
          <p>
            This will grant super admin privileges to your account:{" "}
            <span className="text-white">{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;