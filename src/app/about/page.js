"use client";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white sm:text-5xl">
          About CropMax AI
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Bridging the gap between raw agriculture and high-profit value addition for small-scale Indian farmers.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="space-y-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center">
            <span className="mr-2">🎯</span> Our Mission
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            In India, millions of small and mid-scale farmers suffer from distress selling. When crop harvest peaks, supply overflows in regional mandis, leading to plummeting prices. Farmers are forced to sell their perishables at a loss.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            <strong>CropMax AI</strong> changes this equation by providing real-time data-driven agricultural intelligence. By analyzing mandi costs, transport fees, storage shelf-life, and processing options, we recommend whether to sell raw, store, or process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
              <span className="mr-2">🤖</span> AI Smart Recommendations
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Powered by OpenAI's GPT-4o model, our engine takes into account local weather forecasts, historic mandi rates, and current regional supply to compute highly customized value addition paths (such as turning surplus tomatoes into shelf-stable puree or ketchup).
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
              <span className="mr-2">📈</span> Real-Time Mandi Tracking
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
              We monitor wholesale prices across major state agricultural marketing boards (APMC) and regional hubs, updating transport and storage estimates dynamically to offer farmers the most accurate financial metrics.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 rounded-3xl p-6 md:p-8 border border-emerald-100 dark:border-emerald-950/30 text-center space-y-4">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
            Ready to optimize your crop margins?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto">
            Create an account, submit your crop harvests, and let our algorithms calculate the most profitable path.
          </p>
        </div>
      </div>
    </div>
  );
}
