import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Unauthorized() {
  const { userRole, userProfile } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 mb-2">
        HTTP 403 Forbidden Access
      </span>

      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        Administrative Privileges Required
      </h1>

      <p className="max-w-md text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
        Your current role is <strong className="text-slate-800">{userRole}</strong> assigned to{" "}
        <strong className="text-slate-800">{userProfile?.branchName || "your station"}</strong>. This operational section is strictly restricted to Main Administrators.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
