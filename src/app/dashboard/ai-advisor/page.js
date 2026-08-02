"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Input, Loader, useToast } from "@/components/ui";
import ProtectedRoute from "@/components/ProtectedRoute";

function TypingText({ text, speed = 8, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsFinished(false);
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  const handleSkip = () => {
    setDisplayedText(text);
    setIsFinished(true);
    if (onComplete) onComplete();
  };

  return (
    <div className="relative group">
      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-150/40 dark:border-zinc-850 whitespace-pre-wrap pr-16 min-h-[4.5rem]">
        {displayedText}
        {!isFinished && <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />}
      </p>
      {!isFinished && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-3 bottom-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shadow-sm"
        >
          Skip Typing ⚡
        </button>
      )}
    </div>
  );
}

const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("vercel.app") || hostname.includes("cropmax-ai")) {
      return "https://cropmax-ai.onrender.com";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
};

const API_URL = getApiUrl();
const API_AI = `${API_URL}/api/ai/advise`;
const API_CROPS = `${API_URL}/api/crops`;

export default function AIAdvisor() {
  const [inventoryCrops, setInventoryCrops] = useState([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  
  // Form state
  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    unit: "Quintals",
    location: "",
    question: "",
    simulateError: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [advisoryError, setAdvisoryError] = useState(null);
  
  // DevTools Network logs state
  const [networkLogs, setNetworkLogs] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  const toast = useToast();

  // Loading tips rotation
  const loadingTips = [
    "Analyzing local APMC mandi volumes and supply peaks...",
    "Estimating logistics and freight price spreads for your district...",
    "Querying agricultural economic forecasting models...",
    "Evaluating value-added shelf life and processing feasibility...",
    "Identifying active local buyers and processing cooperatives..."
  ];

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Fetch all crops from inventory to populate selection dropdown
  const fetchInventoryCrops = useCallback(async () => {
    try {
      const token = localStorage.getItem("cropmax_token");
      if (!token) return;

      const res = await fetch(API_CROPS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setInventoryCrops(data);
      }
    } catch (err) {
      console.error("Failed to load inventory crops", err);
    }
  }, []);

  useEffect(() => {
    fetchInventoryCrops();
  }, [fetchInventoryCrops]);

  // Intercept fetch requests for custom Network DevTools simulation
  const loggedFetch = useCallback(async (url, options = {}) => {
    const startTime = Date.now();
    const method = options.method || "GET";
    const logId = Math.random().toString();
    const cleanUrl = url.replace(API_URL, "");

    const token = localStorage.getItem("cropmax_token");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders
      }
    };

    setNetworkLogs((prev) => [
      {
        id: logId,
        url: cleanUrl,
        method,
        status: "PENDING",
        latency: 0,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);

    try {
      const response = await fetch(url, fetchOptions);
      const latency = Date.now() - startTime;
      const status = response.status;

      setNetworkLogs((prev) =>
        prev.map((log) => (log.id === logId ? { ...log, status, latency } : log))
      );
      return response;
    } catch (error) {
      const latency = Date.now() - startTime;
      setNetworkLogs((prev) =>
        prev.map((log) => (log.id === logId ? { ...log, status: "ERR", latency } : log))
      );
      throw error;
    }
  }, []);

  // Sync chosen inventory crop details into the form fields
  const handleInventorySelect = (e) => {
    const id = e.target.value;
    setSelectedInventoryId(id);
    if (!id) {
      setForm({
        cropName: "",
        quantity: "",
        unit: "Quintals",
        location: "",
        question: form.question,
        simulateError: form.simulateError
      });
      return;
    }
    const crop = inventoryCrops.find((c) => c.id === parseInt(id));
    if (crop) {
      setForm({
        cropName: crop.name,
        quantity: crop.quantity.toString(),
        unit: crop.unit,
        location: crop.location,
        question: form.question,
        simulateError: form.simulateError
      });
      toast.info(`Synced details for ${crop.name} from your inventory.`);
    }
  };

  const handleAdvisorSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAiAdvice(null);
    setAdvisoryError(null);

    // Validate fields
    const validationErrors = {};
    if (!form.cropName.trim()) validationErrors.cropName = "Crop name is required";
    if (!form.quantity || Number(form.quantity) <= 0) validationErrors.quantity = "Please enter a valid quantity";
    if (!form.location.trim()) validationErrors.location = "Location/District is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setErrors({});
    setIsLoading(true);
    toast.info("Connecting to CropMax AI Advisor engines...");

    try {
      const response = await loggedFetch(API_AI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cropName: form.cropName,
          quantity: Number(form.quantity),
          unit: form.unit,
          location: form.location,
          question: form.question,
          simulateError: form.simulateError
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error?.message || "AI Advisor request failed");
      }

      const adviceData = await response.json();
      setAiAdvice(adviceData);
      toast.success("AI advisory analysis computed successfully!");
    } catch (err) {
      console.error(err);
      setAdvisoryError(err);
      toast.error(err.message || "Failed to communicate with AI Advisor Service.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save the AI recommended strategy to local CRUD database
  const handleSaveToDashboard = async () => {
    if (!aiAdvice) return;
    try {
      toast.info("Saving optimization strategy to dashboard...");
      const res = await loggedFetch(API_CROPS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.cropName,
          quantity: Number(form.quantity),
          unit: form.unit,
          location: form.location
        })
      });

      if (res.ok) {
        toast.success(`Successfully saved ${form.cropName} analysis to your dashboard history!`);
        fetchInventoryCrops();
      } else {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Failed to save crop.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not save AI recommendation to dashboard.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-48">
        
        {/* Title Header */}
        <div className="bg-gradient-to-r from-emerald-600/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-3xl p-6 md:p-8 border border-emerald-100 dark:border-emerald-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all duration-300">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                CropMax AI Advisor
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-850 dark:text-teal-300 font-semibold border border-teal-200/50">
                LIVE LLM
              </span>
            </div>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
              Construct high-fidelity prompt templates feeding regional yield parameters to Google Gemini or OpenAI. Receive dynamic economic advice, processing guides, price projections, and buyers.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">
              ← Back to Inventory
            </Button>
          </Link>
        </div>

        {/* Advisor Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side - Left 5 Cols */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm h-fit space-y-6 transition-colors duration-300">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center">
              <span className="mr-2">🔍</span> Strategy Parameters
            </h2>

            {/* Inventory Sync Dropdown */}
            {inventoryCrops.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Quick Sync from Inventory
                </label>
                <select
                  value={selectedInventoryId}
                  onChange={handleInventorySelect}
                  className="w-full bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/35 rounded-xl px-3 py-2.5 text-xs focus:outline-none text-zinc-800 dark:text-zinc-300 transition-colors"
                >
                  <option value="">-- Select a saved crop harvest --</option>
                  {inventoryCrops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.quantity} {c.unit}) - {c.location}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleAdvisorSubmit} className="space-y-4">
              <Input
                label="Crop Name"
                placeholder="e.g. Mango, Tomato, Potato, Wheat"
                value={form.cropName}
                onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                error={errors.cropName}
                disabled={isLoading}
              />

              <div className="grid grid-cols-2 gap-4 items-start">
                <Input
                  label="Quantity"
                  type="number"
                  placeholder="e.g. 20"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  error={errors.quantity}
                  disabled={isLoading}
                />
                <div className="flex flex-col space-y-1.5 w-full">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    disabled={isLoading}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-zinc-800 dark:text-zinc-200"
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
                disabled={isLoading}
              />

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Specific Advisory Question (Optional)
                </label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="e.g. Should I process mangoes or sell immediately? What are local storage rates?"
                  disabled={isLoading}
                  rows={3}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-zinc-200 transition-colors placeholder:text-zinc-400 font-normal resize-none"
                />
              </div>

              {/* Error Simulation Checkbox */}
              <div className="flex items-center space-x-2.5 p-3.5 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
                <input
                  type="checkbox"
                  id="simulateError"
                  checked={form.simulateError}
                  onChange={(e) => setForm({ ...form, simulateError: e.target.checked })}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500 dark:bg-zinc-950 dark:border-zinc-850 cursor-pointer"
                />
                <label htmlFor="simulateError" className="text-xs font-semibold text-rose-800 dark:text-rose-400 select-none cursor-pointer">
                  Simulate API Error State (For testing Toast notification)
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full relative py-3.5 flex items-center justify-center gap-2 font-bold shadow-md cursor-pointer hover:scale-[1.01]"
              >
                {isLoading ? (
                  <>
                    <Loader size="sm" className="inline-block animate-spin" />
                    Consulting Models...
                  </>
                ) : (
                  "Consult CropMax AI Advisor"
                )}
              </Button>
            </form>
          </div>

          {/* Advice Output Side - Right 7 Cols */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Loading Cover state overlay */}
            {isLoading && (
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-12 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col items-center justify-center min-h-[450px] space-y-5 animate-pulse">
                <Loader size="lg" className="text-emerald-500 animate-spin" />
                <div className="text-center space-y-2 max-w-sm">
                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">Querying AI Models</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                    "{loadingTips[loadingTipIndex]}"
                  </p>
                </div>
              </div>
            )}

            {/* Error state overlay */}
            {!isLoading && advisoryError && (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-rose-200 dark:border-rose-905/40 shadow-lg flex flex-col items-center justify-center text-center min-h-[450px] space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center text-3xl font-extrabold shadow-inner animate-pulse">
                  ⚠️
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">Consultation Failed</h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/50 dark:bg-rose-950/10 px-4 py-2.5 rounded-xl border border-rose-100/40 dark:border-rose-900/20 font-mono break-words leading-relaxed max-w-sm mx-auto">
                    {advisoryError.message || "Failed to communicate with AI Advisor Service"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 pt-2 leading-relaxed">
                    This might be due to API rate limits, temporary backend downtime, or missing API keys. You can simulate success by turning off 'Simulate API Error State' or clicking retry below.
                  </p>
                </div>
                <Button
                  onClick={handleAdvisorSubmit}
                  className="px-6 py-3 font-bold flex items-center gap-2 cursor-pointer shadow-md bg-gradient-to-r from-emerald-600 to-teal-650 text-white"
                >
                  Retry Consultation 🔄
                </Button>
              </div>
            )}

            {/* Empty advisory landing screen */}
            {!isLoading && !aiAdvice && !advisoryError && (
              <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col items-center justify-center text-center min-h-[450px] space-y-4">
                <span className="text-5xl animate-bounce">🤖</span>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">Advisor Ready</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 max-w-md">
                  Provide your crop details in the parameter card on the left. The AI model will calculate customized value-addition percentages, holding price targets, and local buyers.
                </p>
              </div>
            )}

            {/* AI Advice Output Display */}
            {!isLoading && aiAdvice && !advisoryError && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Main Outcome Card */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
                      <span className="mr-2">💡</span> Recommendation Strategy
                    </h3>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                      aiAdvice.status.includes("Processing") 
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" 
                        : aiAdvice.status.includes("Hold")
                        ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
                        : "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30"
                    }`}>
                      {aiAdvice.status}
                    </span>
                  </div>

                  {/* Highlights Bar */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Projected Premium Margin</span>
                      <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block mt-1">
                        +{aiAdvice.projectedPriceBoost}
                      </span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Holding Target Window</span>
                      <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 block mt-1">
                        {aiAdvice.holdingPeriod}
                      </span>
                    </div>
                  </div>

                  {/* Advice Text */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">AI Market Analysis & Advice</span>
                    <TypingText text={aiAdvice.advice} speed={8} />
                  </div>

                  {/* Market Sentiment */}
                  {aiAdvice.sentiment && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">APMC Price & Supply Sentiment</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {aiAdvice.sentiment}
                      </p>
                    </div>
                  )}
                </div>

                {/* Processing Steps Card */}
                {aiAdvice.valueAddition && (
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                    <h3 className="text-md font-bold text-zinc-900 dark:text-white flex items-center">
                      <span className="mr-2">🧪</span> Value-Addition Pathway
                    </h3>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <pre className="text-xs text-zinc-700 dark:text-zinc-300 font-sans whitespace-pre-line leading-relaxed">
                        {aiAdvice.valueAddition}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Buyers Directory Card */}
                {aiAdvice.suggestedBuyers && aiAdvice.suggestedBuyers.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                    <h3 className="text-md font-bold text-zinc-900 dark:text-white flex items-center">
                      <span className="mr-2">🤝</span> Suggested Local Mandi / Buyers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {aiAdvice.suggestedBuyers.map((buyer, idx) => (
                        <div key={idx} className="border border-zinc-150 dark:border-zinc-800 p-3.5 rounded-2xl bg-zinc-55/30 dark:bg-zinc-950/20 hover:border-emerald-500/40 transition-colors shadow-xs">
                          <span className="block text-xs font-bold text-zinc-900 dark:text-white">{buyer.name}</span>
                          <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">📍 {buyer.location}</span>
                          <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">📞 {buyer.contact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save and Debug Action panel */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60">
                  <Button onClick={handleSaveToDashboard} className="w-full sm:w-auto py-2.5 font-bold cursor-pointer">
                    Save Crop & Advice to Inventory
                  </Button>
                  
                  {/* Model tag details */}
                  <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 text-center sm:text-right sm:ml-auto">
                    AI Engine: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{aiAdvice.provider || "Local-Advisory"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time HTTP Request & Network monitor Console (DevTools simulator) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 text-zinc-200 border-t border-zinc-800 font-mono shadow-2xl transition-all duration-300">
          <div 
            className="flex items-center justify-between px-6 py-3 border-b border-zinc-900 cursor-pointer bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors"
            onClick={() => setIsLogsOpen(!isLogsOpen)}
          >
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Chrome DevTools Simulation - AI Network Logs</span>
              <span className="text-[10px] text-zinc-500">({networkLogs.length} requests logged)</span>
            </div>
            <button className="text-zinc-450 hover:text-white text-xs font-bold transition-colors">
              {isLogsOpen ? "⬇️ Collapse Console" : "⬆️ Expand API logs"}
            </button>
          </div>
          
          {isLogsOpen && (
            <div className="max-h-56 overflow-y-auto px-6 py-3 space-y-1.5 text-xs bg-zinc-950">
              <div className="grid grid-cols-12 font-bold text-zinc-500 border-b border-zinc-900 pb-1.5 mb-1.5">
                <div className="col-span-2">Time</div>
                <div className="col-span-1.5">Method</div>
                <div className="col-span-5.5">Endpoint</div>
                <div className="col-span-1.5 text-center">Status</div>
                <div className="col-span-1.5 text-right">Latency</div>
              </div>
              {networkLogs.length === 0 ? (
                <p className="text-center text-zinc-600 py-6 italic text-[11px]">No active AI advisor requests recorded. consult the AI advisor to trigger network events.</p>
              ) : (
                networkLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 py-1 border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-colors">
                    <div className="col-span-2 text-zinc-500">{log.timestamp}</div>
                    <div className="col-span-1.5 font-bold">
                      <span className="text-amber-400">{log.method}</span>
                    </div>
                    <div className="col-span-5.5 truncate text-zinc-300">{log.url}</div>
                    <div className="col-span-1.5 text-center font-bold">
                      {log.status === "PENDING" ? (
                        <span className="text-zinc-400 animate-pulse">PENDING</span>
                      ) : log.status === "ERR" ? (
                        <span className="text-red-500">FAILED</span>
                      ) : (
                        <span className={log.status >= 200 && log.status < 300 ? "text-emerald-500" : "text-rose-500"}>
                          {log.status} {log.status === 201 ? "Created" : log.status === 200 ? "OK" : log.status}
                        </span>
                      )}
                    </div>
                    <div className="col-span-1.5 text-right text-zinc-400">{log.latency ? `${log.latency}ms` : "-"}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}
