"use client";

import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!credentials.identifier || !credentials.password) return;
    setSuccess(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200/60 dark:border-zinc-800/60 shadow-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access your crop profit optimization panel.
          </p>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-sm font-semibold text-center animate-pulse">
            ✔ Login successful! Redirecting to dashboard...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Phone Number or Email
            </label>
            <input
              type="text"
              placeholder="e.g. +91 98765 43210 or farmer@agri.com"
              value={credentials.identifier}
              onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center space-x-2 text-zinc-500">
              <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-800 text-emerald-600 focus:ring-emerald-500" />
              <span>Remember me</span>
            </label>
            <span className="text-emerald-600 hover:text-emerald-500 cursor-pointer font-medium">Forgot password?</span>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs sm:text-sm text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
          Don't have an account?{" "}
          <span className="text-emerald-600 hover:text-emerald-500 font-bold cursor-pointer">Register here</span>
        </div>

      </div>
    </div>
  );
}
