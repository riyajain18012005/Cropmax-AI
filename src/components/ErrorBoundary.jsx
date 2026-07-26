"use client";

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-8 shadow-2xl space-y-6 transition-all duration-300">
            
            {/* Visual Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 text-3xl font-extrabold shadow-inner animate-pulse">
                ⚠️
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                Something went wrong
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                An unexpected rendering error occurred in the component tree.
              </p>
            </div>

            {/* Error Message Box */}
            <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                Error Message
              </p>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1 break-words">
                {this.state.error?.message || "Unknown rendering exception"}
              </p>
            </div>

            {/* Collapsible details for tech review */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-450 dark:hover:text-zinc-300 flex items-center gap-1.5 focus:outline-none transition-colors cursor-pointer"
              >
                {this.state.showDetails ? "▼ Hide Technical Details" : "▶ Show Technical Details"}
              </button>
              
              {this.state.showDetails && (
                <div className="bg-zinc-950 text-zinc-300 font-mono text-[10px] p-4 rounded-2xl border border-zinc-900 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {this.state.error?.stack}
                  {"\n\n"}
                  Component Stack:
                  {this.state.errorInfo?.componentStack}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-95 px-5 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md border border-emerald-500/20 cursor-pointer"
              >
                Reload App
              </button>
              <button
                type="button"
                onClick={() => window.location.href = "/"}
                className="flex-1 inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-95 px-5 py-2.5 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-200/50 dark:border-zinc-700/30 cursor-pointer"
              >
                Back to Home
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
