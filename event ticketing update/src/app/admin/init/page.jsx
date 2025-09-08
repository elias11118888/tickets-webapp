"use client";
import React from "react";

function MainComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-6">
          Admin Initialize Test Page
        </h1>
        <p className="text-white/80 mb-8">
          This is a test page to verify routing is working correctly.
        </p>
        <a
          href="/"
          className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors inline-flex items-center"
        >
          <i className="fas fa-home mr-2"></i>
          Back to Home
        </a>
      </div>
    </div>
  );
}

export default MainComponent;