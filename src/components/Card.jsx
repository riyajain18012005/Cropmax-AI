"use client";

import Link from "next/link";

export default function Card({
  title,
  description,
  badgeText,
  badgeType = "info", // "info", "success", "warning", "danger"
  imageSrc, // Optional image
  icon, // Optional fallback icon/emoji
  actionText,
  actionHref,
  onClick,
}) {
  const badgeColorMap = {
    info: "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/30",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/30",
    warning: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/30",
    danger: "bg-red-50 text-red-700 border-red-200/50 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/30",
  };

  return (
    <div className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
      {/* Top Section */}
      <div>
        {/* Optional Image or Header Decoration */}
        {imageSrc ? (
          <div className="relative w-full h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-850">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : icon ? (
          <div className="p-6 pb-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          </div>
        ) : null}

        {/* Content Body */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            {badgeText && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeColorMap[badgeType]}`}>
                {badgeText}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
            {title}
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      {(actionText || onClick) && (
        <div className="px-6 pb-6 pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors group/link"
            >
              {actionText}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 ml-1 group-hover/link:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={onClick}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200 dark:border-zinc-700/60 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all duration-200"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
