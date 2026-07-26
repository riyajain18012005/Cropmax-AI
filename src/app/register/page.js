"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, useToast } from "@/components/ui";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Farmer");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!name.trim()) {
      validationErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      validationErrors.name = "Name must be at least 2 characters long";
    }
    
    if (!email.trim()) {
      validationErrors.email = "Email address is required";
    } else if (!emailRegex.test(email.trim())) {
      validationErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      validationErrors.password = "Password is required";
    } else if (password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters long";
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please resolve the errors in the registration form.");
      return;
    }

    setErrors({});
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
      toast.success("Registration successful! Welcome to CropMax AI.");
      router.push("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      setErrorMsg(err.message || "Something went wrong during registration.");
      toast.error(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200/60 dark:border-zinc-800/60 shadow-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Join CropMax AI to maximize your crop values.
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Full Name"
              type="text"
              placeholder="Farmer John"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              className="w-full"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              label="Email Address"
              type="email"
              placeholder="farmer.john@cropmax.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              className="w-full"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="•••••••• (Min. 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              className="w-full"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              <option value="Farmer">Farmer (Cultivates Crops)</option>
              <option value="Processor">Processor (Buys & Processes Crops)</option>
              <option value="Admin">Admin (System Manager)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs sm:text-sm text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-bold">
            Sign in here
          </Link>
        </div>

      </div>
    </div>
  );
}

