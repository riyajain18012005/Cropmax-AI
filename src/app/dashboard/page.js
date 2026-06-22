"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { Button, Input, Modal, useToast, Loader } from "@/components/ui";

/**
 * Farmer Dashboard page showcasing the custom component library (Button, Input, Modal, Toast, Loader).
 */
export default function Dashboard() {
  const [crops, setCrops] = useState([
    { id: 1, name: "Mango", quantity: 15, unit: "Quintals", location: "Nashik, Maharashtra", status: "Processing Recommended", advice: "Convert to Mango Pickle/Juice (+88% profit)" },
    { id: 2, name: "Tomato", quantity: 8, unit: "Quintals", location: "Kolar, Karnataka", status: "Hold Recommended", advice: "Hold for 3 weeks; price projected to rise by 25%" },
  ]);

  const [form, setForm] = useState({ name: "", quantity: "", unit: "Quintals", location: "" });
  const [errors, setErrors] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const toast = useToast();

  const handleAddCrop = (e) => {
    e.preventDefault();

    // Field validations
    const validationErrors = {};
    if (!form.name.trim()) {
      validationErrors.name = "Crop name cannot be empty";
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      validationErrors.quantity = "Please enter a valid quantity greater than 0";
    }
    if (!form.location.trim()) {
      validationErrors.location = "Location/District is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors in the form.");
      return;
    }

    // Reset errors and simulate loading analysis state
    setErrors({});
    setIsAnalyzing(true);
    toast.info("Analyzing market trends and local APMC price spreads...");

    setTimeout(() => {
      // Create value-added status and advice recommendations based on inputs
      const isLargeQty = Number(form.quantity) >= 10;
      const mockStatus = isLargeQty ? "Processing Recommended" : "Hold Recommended";
      const mockAdvice = isLargeQty
        ? `We found a premium value-adding processor in ${form.location}. Converting your ${form.quantity} ${form.unit} of ${form.name} into retail processed goods is projected to raise profits by up to 55%.`
        : `Hold supply of ${form.name} for 2.5 weeks. Major wholesale mandi arrivals in neighboring districts are peaking; prices are projected to rise by 18-22% once gluts resolve.`;

      const newCrop = {
        id: Date.now(),
        name: form.name,
        quantity: Number(form.quantity),
        unit: form.unit,
        location: form.location,
        status: mockStatus,
        advice: mockAdvice,
      };

      setCrops([newCrop, ...crops]);
      setForm({ name: "", quantity: "", unit: "Quintals", location: "" });
      setIsAnalyzing(false);
      toast.success(`Successfully analyzed ${form.name} harvest!`);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Farmer Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Add your current crop harvests and receive immediate AI optimization strategies on whether to sell, hold, or process.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-4 py-2 rounded-xl text-center transition-colors">
            <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">{crops.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Registered Crops</span>
          </div>
          <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 px-4 py-2 rounded-xl text-center transition-colors">
            <span className="block text-xl font-bold text-teal-600 dark:text-teal-400">₹3.45L</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Projected Income</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm h-fit space-y-6 transition-colors duration-300">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center">
            <span className="mr-2">➕</span> Add New Harvest
          </h2>
          
          <form onSubmit={handleAddCrop} className="space-y-4">
            <Input
              label="Crop Name"
              placeholder="e.g. Tomato, Mango, Potato"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              disabled={isAnalyzing}
            />
            
            <div className="grid grid-cols-2 gap-4 items-start">
              <Input
                label="Quantity"
                type="number"
                placeholder="e.g. 15"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                error={errors.quantity}
                disabled={isAnalyzing}
              />
              <div className="flex flex-col space-y-1.5 w-full">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  disabled={isAnalyzing}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Quintals">Quintals</option>
                  <option value="Tons">Tons</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>
            </div>

            <Input
              label="Location / District"
              placeholder="e.g. Nashik, Maharashtra"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              error={errors.location}
              disabled={isAnalyzing}
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isAnalyzing}
              className="w-full relative py-3.5 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader size="sm" className="inline-block" />
                  Analyzing Details...
                </>
              ) : (
                "Analyze with OpenAI GPT-4o"
              )}
            </Button>
          </form>
        </div>

        {/* Right Crop List Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Active Recommendations History
            </h2>
            {isAnalyzing && (
              <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full animate-pulse border border-emerald-100 dark:border-emerald-900/35">
                <Loader size="sm" />
                AI is calculating...
              </span>
            )}
          </div>

          {/* If analyzing, render a pulsing skeleton loader grid as a preview */}
          {isAnalyzing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <Loader type="skeleton" className="w-1/2 h-5" />
                  <Loader type="skeleton" className="w-16 h-5 rounded-full" />
                </div>
                <Loader type="skeleton" className="w-full h-10" />
                <Loader type="skeleton" className="w-1/3 h-8 mt-2" />
              </div>
            </div>
          )}

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
                onClick={() => setSelectedCrop(crop)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Accessible Focus-Trapping Modal for Analysis Details */}
      <Modal
        isOpen={!!selectedCrop}
        onClose={() => setSelectedCrop(null)}
        title={selectedCrop ? `${selectedCrop.name} Optimization Strategy` : ""}
      >
        {selectedCrop && (
          <div className="space-y-5">
            <div className="flex items-center space-x-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-800 dark:text-emerald-300">
              <span className="text-2xl">
                {selectedCrop.name === "Mango" ? "🥭" : selectedCrop.name === "Tomato" ? "🍅" : "🌾"}
              </span>
              <div>
                <h4 className="font-bold text-sm">AI Recommendation</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Calculated using GPT-4o models</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Detailed Advice</span>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                {selectedCrop.advice}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Quantity</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-1 block">
                  {selectedCrop.quantity} {selectedCrop.unit}
                </span>
              </div>
              <div className="border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Mandi Center</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-1 block truncate">
                  {selectedCrop.location}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-150 dark:border-zinc-800/60">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCrop(null)}
              >
                Close Report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
