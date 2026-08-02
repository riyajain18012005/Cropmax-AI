"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Card from "@/components/Card";
import { Button, Input, Modal, useToast, Loader } from "@/components/ui";
import ProtectedRoute from "@/components/ProtectedRoute";

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
const API_BASE = `${API_URL}/api/crops`;

/**
 * Farmer Dashboard page connected to the Node/Express backend REST API.
 * Showcases full integration with CRUD, search, dynamic stats, loading/toast notification states,
 * and a simulated Chrome DevTools Network tab showing successful API calls (status 200).
 */
export default function Dashboard() {
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "", unit: "Quintals", location: "" });
  const [errors, setErrors] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropToDelete, setCropToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ totalCrops: 0, projectedIncome: "₹0.00" });
  const [editingCropId, setEditingCropId] = useState(null);
  
  // Custom DevTools Network logs simulator state
  const [networkLogs, setNetworkLogs] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  const toast = useToast();
  const isFirstRender = useRef(true);

  // Intercept fetch requests to display in the custom Network DevTools drawer
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

    // Add entry to logs
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

  // Fetch all crops (or filtered by search query)
  const fetchCrops = useCallback(async (searchVal = "") => {
    try {
      setIsLoading(true);
      const url = searchVal.trim()
        ? `${API_BASE}/search?q=${encodeURIComponent(searchVal.trim())}`
        : API_BASE;
      
      const res = await loggedFetch(url);
      if (!res.ok) {
        throw new Error("Could not fetch harvests list from server");
      }
      const data = await res.json();
      setCrops(data);
    } catch (err) {
      console.error("Fetch crops error:", err);
      toast.error("Failed to connect to backend server. Make sure server is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  }, [toast, loggedFetch]);

  // Fetch aggregate dashboard metrics
  const fetchStats = useCallback(async () => {
    try {
      const res = await loggedFetch(`${API_BASE}/stats`);
      if (!res.ok) {
        throw new Error("Could not retrieve dashboard statistics");
      }
      const data = await res.json();
      setStats({
        totalCrops: data.totalCrops,
        projectedIncome: data.projectedIncome
      });
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  }, [loggedFetch]);

  // Initialize load
  useEffect(() => {
    fetchCrops();
    fetchStats();
  }, [fetchCrops, fetchStats]);

  // Debounced search trigger
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchCrops(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchCrops]);


  // Start editing a harvest entry
  const handleStartEdit = (crop) => {
    setEditingCropId(crop.id);
    setForm({
      name: crop.name,
      quantity: crop.quantity,
      unit: crop.unit,
      location: crop.location
    });
    toast.info(`Editing ${crop.name} harvest. Update details and submit.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit harvest form (handles both create and update)
  const handleFormSubmit = async (e) => {
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

    // Reset errors and start loading spinner
    setErrors({});
    setIsAnalyzing(true);
    
    const isEditing = !!editingCropId;
    if (isEditing) {
      toast.info("Updating harvest details and recalculating strategies...");
    } else {
      toast.info("Analyzing market trends and local APMC price spreads...");
    }

    try {
      const url = isEditing ? `${API_BASE}/${editingCropId}` : API_BASE;
      const method = isEditing ? "PUT" : "POST";

      const res = await loggedFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          quantity: Number(form.quantity),
          unit: form.unit,
          location: form.location
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || `Failed to ${isEditing ? 'update' : 'analyze'} crop harvest`);
      }

      const savedCrop = await res.json();
      
      // Update UI state
      if (isEditing) {
        setCrops((prevCrops) => prevCrops.map((c) => c.id === editingCropId ? savedCrop : c));
        toast.success(`Successfully updated and re-analyzed ${savedCrop.name}!`);
        setEditingCropId(null);
      } else {
        setCrops((prevCrops) => [savedCrop, ...prevCrops]);
        toast.success(`Successfully analyzed ${savedCrop.name} harvest!`);
      }
      
      setForm({ name: "", quantity: "", unit: "Quintals", location: "" });
      
      // Refresh aggregate metrics
      fetchStats();
    } catch (err) {
      console.error("Submit crop error:", err);
      toast.error(err.message || "Failed to communicate harvest data with the API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Delete harvest entry
  const performDeleteCrop = async (id) => {
    try {
      setIsLoading(true);
      const res = await loggedFetch(`${API_BASE}/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Failed to delete the harvest record");
      }

      toast.success("Harvest entry deleted successfully.");
      
      // Refresh crops and stats
      fetchCrops(searchQuery);
      fetchStats();
    } catch (err) {
      console.error("Delete crop error:", err);
      toast.error(err.message || "Unable to delete harvest record.");
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-48">
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
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-4 py-2 rounded-xl text-center transition-colors w-24">
            <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalCrops}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Crops</span>
          </div>
          <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 px-4 py-2 rounded-xl text-center transition-colors min-w-[100px]">
            <span className="block text-xl font-bold text-teal-600 dark:text-teal-400">{stats.projectedIncome}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Projected Income</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm h-fit space-y-6 transition-colors duration-300">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center">
            <span className="mr-2">{editingCropId ? "📝" : "➕"}</span> {editingCropId ? "Edit Harvest Entry" : "Add New Harvest"}
          </h2>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
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
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-zinc-850 dark:text-zinc-200"
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

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isAnalyzing}
                className="w-full relative py-3.5 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader size="sm" className="inline-block" />
                    {editingCropId ? "Updating Details..." : "Analyzing Details..."}
                  </>
                ) : (
                  editingCropId ? "Update Harvest Analysis" : "Analyze with OpenAI GPT-4o"
                )}
              </Button>
              {editingCropId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingCropId(null);
                    setForm({ name: "", quantity: "", unit: "Quintals", location: "" });
                    toast.info("Edit cancelled.");
                  }}
                  className="w-full py-2.5"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Right Crop List Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3 gap-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Active Recommendations History
            </h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="🔍 Search crops or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-zinc-200 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-250 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
              {(isAnalyzing || (isLoading && crops.length === 0)) && (
                <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-full animate-pulse border border-emerald-100 dark:border-emerald-900/35">
                  <Loader size="sm" />
                  Updating...
                </span>
              )}
            </div>
          </div>

          {/* Skeleton Loaders */}
          {isLoading && crops.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {[1, 2].map((i) => (
                <div key={i} className="border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="w-1/2 h-5 bg-zinc-200 dark:bg-zinc-850 rounded" />
                    <div className="w-16 h-5 rounded-full bg-zinc-200 dark:bg-zinc-850" />
                  </div>
                  <div className="w-full h-10 bg-zinc-200 dark:bg-zinc-850 rounded" />
                  <div className="w-1/3 h-8 mt-2 bg-zinc-200 dark:bg-zinc-850 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && crops.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-950/20">
              <span className="text-4xl mb-4">🌾</span>
              <h3 className="text-md font-bold text-zinc-900 dark:text-white">No Harvests Found</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-1 max-w-sm">
                {searchQuery
                  ? `No harvest records matched "${searchQuery}". Try refining your search query.`
                  : "No crop harvests registered yet. Fill out the form on the left to evaluate your yield options."}
              </p>
            </div>
          )}

          {/* Crops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crops.map((crop) => (
              <div key={crop.id} className="relative group/card h-full">
                <Card
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
                  icon={crop.name.toLowerCase().includes("mango") ? "🥭" : crop.name.toLowerCase().includes("tomato") ? "🍅" : crop.name.toLowerCase().includes("potato") ? "🥔" : "🌾"}
                  actionText="View Analysis Report"
                  onClick={() => setSelectedCrop(crop)}
                />
                
                {/* Dynamic Edit Button visible on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(crop);
                  }}
                  title="Edit harvest entry"
                  className="absolute top-4 right-14 z-10 p-2 rounded-xl bg-zinc-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/30 text-zinc-400 hover:text-emerald-500 border border-zinc-200/40 dark:border-zinc-700/40 hover:border-emerald-200/50 dark:hover:border-emerald-900/40 opacity-0 group-hover/card:opacity-100 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </button>
                
                {/* Dynamic Delete Button visible on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCropToDelete(crop);
                  }}
                  title="Delete harvest entry"
                  className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-zinc-100 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 border border-zinc-200/40 dark:border-zinc-700/40 hover:border-red-200/50 dark:hover:border-red-900/40 opacity-0 group-hover/card:opacity-100 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
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
                {selectedCrop.name.toLowerCase().includes("mango") ? "🥭" : selectedCrop.name.toLowerCase().includes("tomato") ? "🍅" : selectedCrop.name.toLowerCase().includes("potato") ? "🥔" : "🌾"}
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
                <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-1 block truncate font-medium">
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

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={!!cropToDelete}
        onClose={() => setCropToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">
            Are you sure you want to delete the harvest record for <span className="font-bold text-zinc-900 dark:text-white">{cropToDelete?.name} ({cropToDelete?.quantity} {cropToDelete?.unit})</span>? This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
            <Button
              variant="secondary"
              onClick={() => setCropToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-500 text-white font-medium border border-rose-500/20"
              onClick={() => {
                const id = cropToDelete.id;
                setCropToDelete(null);
                performDeleteCrop(id);
              }}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Chrome DevTools Simulation - API Network Logs</span>
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
              <p className="text-center text-zinc-600 py-6 italic text-[11px]">No active REST API requests recorded. Interact with the dashboard to trigger network events.</p>
            ) : (
              networkLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-12 py-1 border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-colors">
                  <div className="col-span-2 text-zinc-500">{log.timestamp}</div>
                  <div className="col-span-1.5 font-bold">
                    <span className={log.method === "POST" ? "text-amber-400" : log.method === "DELETE" ? "text-rose-500" : log.method === "PUT" ? "text-purple-400" : "text-sky-400"}>
                      {log.method}
                    </span>
                  </div>
                  <div className="col-span-5.5 truncate text-zinc-300">{log.url}</div>
                  <div className="col-span-1.5 text-center font-bold">
                    {log.status === "PENDING" ? (
                      <span className="text-zinc-400 animate-pulse">PENDING</span>
                    ) : log.status === "ERR" ? (
                      <span className="text-red-500">FAILED</span>
                    ) : (
                      <span className={log.status >= 200 && log.status < 300 ? "text-emerald-500" : "text-rose-500"}>
                        {log.status} {log.status === 204 ? "No Content" : log.status === 201 ? "Created" : "OK"}
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


