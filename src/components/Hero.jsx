"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-zinc-950/20 dark:via-zinc-900/50 dark:to-zinc-900 py-16 sm:py-24 transition-all duration-300">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/40 dark:border-emerald-800/30 mb-6 animate-pulse">
              <span>🌾 Powered by GPT-4o Intelligence</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Maximize Your Farm Income with{" "}
              <span className="block mt-1 bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                AI-Driven Crop Profit
              </span>
              Optimization
            </h1>
            
            <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Don't sell your raw harvest in distress. CropMax AI uses artificial intelligence to tell you exactly whether to sell raw, process your crops into value-added products (like Mango to Pickle), or hold for higher future mandi prices.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 group"
              >
                Analyze Your Crop
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 border border-zinc-200 dark:border-zinc-800 text-base font-medium rounded-xl text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm transition-all duration-200"
              >
                Learn How It Works
              </Link>
            </div>
            
            {/* Quick Metrics */}
            <div className="mt-8 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/40 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="block text-2xl font-bold text-zinc-900 dark:text-white">35%+</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-500 mt-1">Average Profit Increase</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-zinc-900 dark:text-white">100+</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-500 mt-1">Indian Mandis Tracked</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-zinc-900 dark:text-white">GPT-4o</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-500 mt-1">Market Analysis AI</span>
              </div>
            </div>
          </div>

          {/* Graphic Side */}
          <div className="mt-12 lg:mt-0 lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg aspect-square bg-gradient-to-tr from-emerald-100/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-zinc-900/40 rounded-3xl p-6 border border-emerald-200/30 dark:border-zinc-800/30 shadow-xl backdrop-blur-sm flex flex-col justify-between">
              {/* Decorative nodes */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-400/20 dark:teal-900/10 rounded-full blur-xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-400/20 dark:emerald-950/20 rounded-full blur-2xl" />

              {/* Graphic Title */}
              <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-semibold text-zinc-500">Live AI Profit Simulator</span>
              </div>

              {/* Simulated Chart/Dashboard */}
              <div className="flex-1 flex flex-col justify-center space-y-6 py-6">
                {/* Crop Item Row */}
                <div className="bg-white/80 dark:bg-zinc-900/80 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🥭</span>
                    <div>
                      <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">Mango harvest</span>
                      <span className="block text-xs text-zinc-500">15 Quintals • Maharashtra</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/30">
                    AI Decision Pending
                  </span>
                </div>

                {/* AI Decision Result Card */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/10 shadow-inner space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-5 -mt-5" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">★ Recommended Strategy</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">98% Confidence</span>
                  </div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
                    <span>Process to Mango Pickle</span>
                  </div>
                  {/* Progress/Comparison Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-500">Net Profit (Processed)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹1,85,000</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full w-[85%]" />
                    </div>
                    
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-zinc-400">Raw Selling Profit</span>
                      <span className="text-zinc-500">₹98,000</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-zinc-400 dark:bg-zinc-600 h-full rounded-full w-[45%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom tag */}
              <div className="flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-3">
                <span>Calculated with processing fees, labor, and transport costs</span>
                <span className="text-emerald-500 font-bold">✓ Optimized</span>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
