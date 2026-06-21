import Hero from "@/components/Hero";
import Card from "@/components/Card";

export default function Home() {
  const strategies = [
    {
      title: "Direct Mandi Selling",
      description: "Get real-time live prices from over 100+ local government APMC mandis. Best for immediate cash requirements and fast crop turnaround.",
      badgeText: "Immediate Cash",
      badgeType: "info",
      icon: "🏪",
      actionText: "Check Mandi Prices",
      actionHref: "/dashboard"
    },
    {
      title: "Value-Added Processing",
      description: "Multiply your profits by converting perishable crops into processed goods. For example, convert Mangoes to Pickle/Juice or Tomatoes to Paste.",
      badgeText: "Highest Profits",
      badgeType: "success",
      icon: "🧪",
      actionText: "Explore Value Addition",
      actionHref: "/dashboard"
    },
    {
      title: "Smart Cold Storage",
      description: "Avoid distress selling during peak season harvest gluts. Store crops in certified cold storage facilities and wait for the optimal price window.",
      badgeText: "Optimal Holding",
      badgeType: "warning",
      icon: "❄️",
      actionText: "Locate Cold Storage",
      actionHref: "/dashboard"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Strategies Grid Section */}
      <section className="py-16 bg-white dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl">
              Maximize Your Harvest Income
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-500 dark:text-zinc-400">
              CropMax AI analyzes your crop details, location, and market supply data to recommend the most profitable path. Choose a strategy to learn more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {strategies.map((strat, idx) => (
              <Card
                key={idx}
                title={strat.title}
                description={strat.description}
                badgeText={strat.badgeText}
                badgeType={strat.badgeType}
                icon={strat.icon}
                actionText={strat.actionText}
                actionHref={strat.actionHref}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Insights Section (Aesthetic banner) */}
      <section className="py-16 bg-emerald-600 dark:bg-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20">
            India-Wide Coverage
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Empowering 50,000+ Farmers Across 12 States
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-100">
            From Maharashtra's onions to Uttar Pradesh's potatoes, our models are trained on regional cost metrics to ensure local feasibility.
          </p>
        </div>
      </section>
    </div>
  );
}
