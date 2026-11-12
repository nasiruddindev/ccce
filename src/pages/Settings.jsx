import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  Shield,
  RotateCcw,
  Save,
  CheckCircle2,
  Lock,
  Layers,
  Zap
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function Settings() {
  const { currentRole, switchRole, resetToDemo } = useInventory();
  const [savedNotice, setSavedNotice] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("VoltFlow Electrical Industries Ltd.");
  const [regNo, setRegNo] = useState("BIN-00389104-2021");
  const [currency, setCurrency] = useState("BDT (৳)");
  const [defaultAlertLevel, setDefaultAlertLevel] = useState("50");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Enterprise Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure multi-branch preferences, inventory alert thresholds, and temporary user roles.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuration saved successfully.</span>
        </div>
      )}

      {/* Firebase & Enterprise Security Status Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Firebase Cloud Infrastructure Status</h3>
            <p className="text-xs text-slate-500">Authentication, Cloud Firestore, and Role Claims Service Architecture</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Auth Mode</span>
            <p className="font-bold text-slate-900 mt-1">Firebase Authentication</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Persistent Local Session</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Database Layer</span>
            <p className="font-bold text-slate-900 mt-1">Cloud Firestore</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Collection: `users` & RBAC</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Public Registration</span>
            <p className="font-bold text-rose-600 mt-1">Strictly Disabled</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Admin Provisioning Only</p>
          </div>
        </div>
      </div>

      {/* Enterprise Company Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Enterprise Organization Profile</h3>
            <p className="text-xs text-slate-500">Corporate legal identity, branding, and registration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Full Legal Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tax / BIN Registration Number
            </label>
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operational Currency
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Global Default Low-Stock Safety Threshold
            </label>
            <input
              type="number"
              value={defaultAlertLevel}
              onChange={(e) => setDefaultAlertLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dispatch & Alert Notifications
          </h4>

          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                Send email alert to in-charge engineer upon challan dispatch
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                Send SMS notification for critical low-stock safety hazards
              </span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Reset Demo Data Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Reset Local Storage & Demo Data</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Restore electrical mock catalog, branch list, and stock counts back to original demonstration values.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetToDemo();
            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 3000);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-semibold transition border border-slate-200 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
}
