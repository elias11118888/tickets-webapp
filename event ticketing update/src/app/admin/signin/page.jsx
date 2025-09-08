"use client";
import React from "react";

function MainComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithCredentials } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in the user
      await signInWithCredentials({
        email,
        password,
        redirect: false,
      });

      // Wait a moment for the session to be established
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user has admin role (no body needed since it uses session)
      const roleResponse = await fetch("/api/CheckRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!roleResponse.ok) {
        throw new Error("Failed to verify admin role");
      }

      const { role, isAdmin } = await roleResponse.json();

      if (!isAdmin) {
        throw new Error("Access denied. Admin privileges required.");
      }

      // Redirect based on role
      if (role === "super_admin") {
        window.location.href = "/super-admin/dashboard";
      } else if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (role === "sub_admin") {
        window.location.href = "/sub-admin/dashboard";
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError(
        error.message ||
          "Failed to sign in. Please check your credentials and try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <i className="fas fa-user-shield text-[#357AFF] text-5xl mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Sign In</h2>
          <p className="text-white/70">Access the EventTix admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white/70 text-sm mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#357AFF] focus:ring-1 focus:ring-[#357AFF]"
              placeholder="admin@eventtix.com"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#357AFF] focus:ring-1 focus:ring-[#357AFF]"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#357AFF] text-white py-3 rounded-lg font-semibold hover:bg-[#2E69DE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-white/70 hover:text-white transition-colors text-sm"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Homepage
          </a>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/50 text-xs">
            First time? Visit{" "}
            <a
              href="/admin/initialize"
              className="text-[#357AFF] hover:underline"
            >
              Admin Setup
            </a>{" "}
            to get started
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;