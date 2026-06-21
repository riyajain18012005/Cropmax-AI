"use client";

import { useState } from "react";
import Card from "@/components/Card";

export default function Dashboard() {
  const [crops, setCrops] = useState([
    { id: 1, name: "Mango", quantity: 15, unit: "Quintals", location: "Nashik, Maharashtra", status: "Processing Recommended", advice: "Convert to Mango Pickle/Juice (+88% profit)" },
    { id: 2, name: "Tomato", quantity: 8, unit: "Quintals", location: "Kolar, Karnataka", status: "Hold Recommended", advice: "Hold for 3 weeks; price projected to rise by 25%" },
  ]);

  const [form, setForm] = useState({ name: "", quantity: "", unit: "Quintals", location: "" });

  const handleAddCrop = (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.location) return;
    const newCrop = {
      id: crops.length + 1,
      name: form.name,
      quantity: Number(form.quantity),
      unit: form.unit,
      location: form.location,
      status: "Analyzing...",
      advice: "Calculating optimal selling windows and processing costs...",
    };
    setCrops([newCrop, ...crops]);
    setForm({ name: "", quantity: "", unit: "Quintals", location: "" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Farmer Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Add your current crop harvests and receive immediate AI optimization strategies on whether to sell, hold, or process.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-4 py-2 rounded-xl text-center">
            <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">{crops.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Registered Crops</span>
          </div>
          <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 px-4 py-2 rounded-xl text-center">
            <span className="block text-xl font-bold text-teal-600 dark:text-teal-400">₹2.83L</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Projected Income</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm h-fit space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center">
            <span className="mr-2">➕</span> Add New Harvest
          </h2>
          <form onSubmit={handleAddCrop} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Crop Name</label>
              <input
                type="text"
                placeholder="e.g. Tomato, Mango, Potato"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Quantity</label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Quintals">Quintals</option>
                  <option value="Tons">Tons</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Location / District</label>
              <input
                type="text"
                placeholder="e.g. Nashik, Maharashtra"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200"
            >
              Analyze with OpenAI GPT-4o
            </button>
          </form>
        </div>

        {/* Right Crop List Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
            Active Recommendations History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crops.map((crop) => (
              <Card
                key={crop.id}
                title={`${crop.name} - ${crop.quantity} ${crop.unit}`}
                description={`Harvest Location: ${crop.location}. recommendation state is currently flagged as: ${crop.status}.`}
                badgeText={crop.status}
                badgeType={
                  crop.status.includes("Processing")
                    ? "success"
                    : crop.status.includes("Hold")
                    ? "warning"
                    : "info"
                }
                icon={crop.name === "Mango" ? "🥭" : crop.name === "Tomato" ? "🍅" : "🌾"}
                actionText="View Analysis Report"
                onClick={() => alert(`Details for crop recommendation: ${crop.advice}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
