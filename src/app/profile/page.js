"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-lg overflow-hidden transition-all duration-300">
          
          {/* Cover Header */}
          <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white border-4 border-white dark:border-zinc-900 flex items-center justify-center text-3xl font-extrabold shadow-md">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="pt-16 pb-8 px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {user?.name || "Farmer Profile"}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Manage your crop optimization credentials
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={logout} 
                  variant="danger" 
                  className="bg-rose-600 hover:bg-rose-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Log Out
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
              
              {/* Account Stats */}
              <div className="col-span-1 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/40 text-center">
                <span className="block text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                  {user?.cropCount ?? 0}
                </span>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Crops Monitored
                </span>
              </div>

              {/* Account Info Fields */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                      Email Address
                    </label>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {user?.email || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                      System Role
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/30">
                      {user?.role || "Farmer"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                      OAuth Registered
                    </label>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                      {user?.oauthProvider || "Standard Credentials"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                      Joined Date
                    </label>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "—"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
