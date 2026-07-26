"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast, Input } from "@/components/ui";

export default function Login() {
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const { login, API_URL } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Field validations
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!credentials.identifier.trim()) {
      validationErrors.identifier = "Email address is required";
    } else if (!emailRegex.test(credentials.identifier.trim())) {
      validationErrors.identifier = "Please enter a valid email address";
    }
    
    if (!credentials.password) {
      validationErrors.password = "Password is required";
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please resolve the errors in the login form.");
      return;
    }

    setErrors({});
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await login(credentials.identifier, credentials.password);
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      if (err.status === 429) {
        setErrorMsg("⚠️ Too many requests. Rate limit exceeded! Please wait 1 minute before trying again.");
        toast.error("Rate limit exceeded! (429)");
      } else {
        setErrorMsg(err.message || "Invalid email or password.");
        toast.error(err.message || "Login failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    // Redirect the browser directly to the Express backend OAuth route
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200/60 dark:border-zinc-800/60 shadow-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access your crop profit optimization panel.
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-semibold text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. farmer.john@cropmax.ai"
            value={credentials.identifier}
            onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
            error={errors.identifier}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            error={errors.password}
            disabled={isSubmitting}
            required
          />

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center space-x-2 text-zinc-500 cursor-pointer select-none">
              <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-850 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
              <span>Remember me</span>
            </label>
            <span className="text-emerald-600 hover:text-emerald-500 cursor-pointer font-medium">Forgot password?</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-between my-4">
          <span className="w-1/5 border-b border-zinc-200 dark:border-zinc-800"></span>
          <span className="text-xs text-zinc-400 uppercase font-bold">Or Sign In With</span>
          <span className="w-1/5 border-b border-zinc-200 dark:border-zinc-800"></span>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            className="flex items-center justify-center space-x-2 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors font-medium text-xs sm:text-sm cursor-pointer"
          >
            <span className="text-red-500 font-bold">G</span>
            <span className="text-zinc-700 dark:text-zinc-300">Google</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleOAuthLogin("github")}
            className="flex items-center justify-center space-x-2 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors font-medium text-xs sm:text-sm cursor-pointer"
          >
            <span className="text-zinc-800 dark:text-white font-bold">🐙</span>
            <span className="text-zinc-700 dark:text-zinc-300">GitHub</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs sm:text-sm text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-emerald-600 hover:text-emerald-500 font-bold">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}

