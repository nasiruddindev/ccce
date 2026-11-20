import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
        <HelpCircle className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 mb-2">
        HTTP 404 &bull; Station Route Not Found
      </span>

      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        Page Not Found
      </h1>

      <p className="max-w-md text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
        The requested URL was not found on this terminal. The module may have been moved or you may have followed an outdated bookmark.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
