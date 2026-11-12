import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import {
  Zap,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Info,
  Flame,
  UserPlus
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isFirebaseConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    location.state?.error || ""
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  // Where to redirect after login
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBootstrapAdmin = async () => {
    if (!email || !password) {
      setErrorMessage("Please type an email and password above to initialize as the first Main Admin.");
      return;
    }
    setIsBootstrapping(true);
    setErrorMessage("");
    try {
      await authService.bootstrapFirstAdmin({
        email,
        password,
        fullName: "Engr. Rafiqul Islam",
        phone: "+880 1711-234567"
      });
      setSuccessMessage("First Main Admin successfully provisioned in Firebase! Authenticating...");
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || "Failed to initialize Admin.");
    } finally {
      setIsBootstrapping(false);
    }
  };

  // Quick fill demo credentials for testing
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0A101D] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-900/40 mb-2">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            VoltFlow Enterprise
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400">Power Grid Substation Hub</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <Flame className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              <span>Firebase: ccce-ec559</span>
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-5">
          <div className="pb-3 border-b border-slate-800/80">
            <h2 className="text-base font-bold text-white">Sign In to Your Station</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your enterprise email and security credentials.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@voltflow.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Notice */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Keep session active</span>
              </label>
              <span className="text-slate-500 text-[11px]">Enterprise SSO</span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Registration Disabled Notice & Initial Admin Bootstrap */}
          <div className="pt-3 border-t border-slate-800 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              <strong className="text-slate-300">Public registration is disabled.</strong> Accounts are provisioned and assigned to substations only by a Main Administrator.
            </p>
            <button
              type="button"
              onClick={handleBootstrapAdmin}
              disabled={isBootstrapping}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isBootstrapping ? "Provisioning in Firebase..." : "First-time project setup? Provision Initial Main Admin"}</span>
            </button>
          </div>
        </div>

        {/* Development & Testing Credentials Quick-Fill Pill */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Phase 2 Quick Testing Accounts:</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin@voltflow.com", "admin123")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-blue-950/60 hover:border-blue-700 border border-slate-700 text-left transition"
            >
              <p className="font-bold text-blue-400 text-[11px]">Main Admin</p>
              <p className="text-[10px] text-slate-300 truncate">admin@voltflow.com</p>
              <p className="text-[9px] text-slate-400 font-mono">Password: admin123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("engineer.tanvir@voltflow.com", "eng123")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-950/60 hover:border-emerald-700 border border-slate-700 text-left transition"
            >
              <p className="font-bold text-emerald-400 text-[11px]">Branch Engineer</p>
              <p className="text-[10px] text-slate-300 truncate">engineer.tanvir@...</p>
              <p className="text-[9px] text-slate-400 font-mono">Password: eng123</p>
            </button>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
            <span>Disabled Account Test:</span>
            <button
              type="button"
              onClick={() => handleQuickFill("disabled.user@voltflow.com", "user123")}
              className="text-rose-400 hover:underline"
            >
              disabled.user@voltflow.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
