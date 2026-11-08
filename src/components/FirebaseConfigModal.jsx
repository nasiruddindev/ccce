import React, { useState } from "react";
import { X, Flame, Check, AlertCircle, Copy, ExternalLink, Database } from "lucide-react";
import { getStoredFirebaseConfig, initFirebase } from "../firebase";
import { useInventory } from "../context/InventoryContext";

export default function FirebaseConfigModal({ isOpen, onClose }) {
  const { firebaseStatus, setFirebaseStatus } = useInventory();

  const stored = getStoredFirebaseConfig() || {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

  const [config, setConfig] = useState(stored);
  const [jsonInput, setJsonInput] = useState("");
  const [activeTab, setActiveTab] = useState("fields"); // 'fields' | 'json' | 'rules'
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleJsonPaste = (text) => {
    setJsonInput(text);
    try {
      // Find object inside script or raw json
      const cleaned = text.trim();
      let parsed = null;
      if (cleaned.startsWith("{")) {
        parsed = JSON.parse(cleaned);
      } else {
        // extract key: value pairs safely with regex
        const extractKey = (keyName) => {
          const matchKey = cleaned.match(new RegExp(`${keyName}\\s*:\\s*["']([^"']+)["']`));
          return matchKey ? matchKey[1] : "";
        };

        const parsedConfig = {
          apiKey: extractKey("apiKey"),
          authDomain: extractKey("authDomain"),
          projectId: extractKey("projectId"),
          storageBucket: extractKey("storageBucket"),
          messagingSenderId: extractKey("messagingSenderId"),
          appId: extractKey("appId")
        };

        if (parsedConfig.apiKey) {
          parsed = parsedConfig;
        }
      }

      if (parsed && parsed.apiKey) {
        setConfig({
          apiKey: parsed.apiKey || "",
          authDomain: parsed.authDomain || "",
          projectId: parsed.projectId || "",
          storageBucket: parsed.storageBucket || "",
          messagingSenderId: parsed.messagingSenderId || "",
          appId: parsed.appId || ""
        });
        setStatusMessage("Firebase config parsed successfully!");
        setIsSuccess(true);
      }
    } catch (e) {
      // ignore parsing errors while typing
    }
  };

  const handleSave = () => {
    if (!config.apiKey || !config.projectId) {
      setStatusMessage("Please provide at least apiKey and projectId.");
      setIsSuccess(false);
      return;
    }

    try {
      localStorage.setItem("voltflow_firebase_config", JSON.stringify(config));
      const res = initFirebase(config);
      if (res.isConfigured) {
        setFirebaseStatus({ isConfigured: true, syncing: false, error: null });
        setStatusMessage("Firebase connected successfully! Collections will sync to Cloud Firestore.");
        setIsSuccess(true);
        setTimeout(() => onClose(), 1500);
      } else {
        setStatusMessage("Connection failed: " + (res.error || "Unknown error"));
        setIsSuccess(false);
      }
    } catch (err) {
      setStatusMessage("Failed to save: " + err.message);
      setIsSuccess(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("voltflow_firebase_config");
    setFirebaseStatus({ isConfigured: false, syncing: false, error: null });
    setStatusMessage("Disconnected from Firebase. Working in Local Storage mode.");
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161B23] border border-[#2B3547] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#242C3C] flex items-center justify-between bg-[#13171F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Firebase Database Setup</h2>
              <p className="text-[11px] text-slate-400">Connect to your Firebase Firestore project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pill */}
        <div className="px-5 py-2.5 bg-[#12161E] border-b border-[#222938] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${firebaseStatus.isConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
            <span className="text-slate-300">
              Status: <strong className={firebaseStatus.isConfigured ? "text-emerald-400" : "text-amber-400"}>
                {firebaseStatus.isConfigured ? "Connected to Cloud Firestore" : "Local Storage (Demo Mode)"}
              </strong>
            </span>
          </div>
          {firebaseStatus.isConfigured && (
            <button
              onClick={handleDisconnect}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-medium underline"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-[#222938] px-5 pt-3 gap-3 text-xs bg-[#141820]">
          <button
            onClick={() => setActiveTab("fields")}
            className={`pb-2 font-medium border-b-2 transition ${
              activeTab === "fields" ? "border-orange-500 text-orange-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Config Fields
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`pb-2 font-medium border-b-2 transition ${
              activeTab === "json" ? "border-orange-500 text-orange-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Paste JSON Object
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`pb-2 font-medium border-b-2 transition ${
              activeTab === "rules" ? "border-orange-500 text-orange-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Firestore Rules
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {statusMessage && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              isSuccess ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}>
              {isSuccess ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {activeTab === "fields" && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">API Key *</label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Project ID *</label>
                  <input
                    type="text"
                    placeholder="voltflow-ccc"
                    value={config.projectId}
                    onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                    className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Auth Domain</label>
                  <input
                    type="text"
                    placeholder="voltflow-ccc.firebaseapp.com"
                    value={config.authDomain}
                    onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                    className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    placeholder="voltflow-ccc.appspot.com"
                    value={config.storageBucket}
                    onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                    className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">App ID</label>
                  <input
                    type="text"
                    placeholder="1:123456789:web:abcdef"
                    value={config.appId}
                    onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                    className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "json" && (
            <div className="space-y-2">
              <p className="text-slate-400">
                Go to Firebase Console &gt; Project Settings &gt; General &gt; Your Apps, and copy the <code>firebaseConfig</code> code snippet here:
              </p>
              <textarea
                rows={6}
                value={jsonInput}
                onChange={(e) => handleJsonPaste(e.target.value)}
                placeholder={'{\n  "apiKey": "AIzaSy...",\n  "authDomain": "...",\n  "projectId": "..."\n}'}
                className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl p-3 text-white font-mono text-xs focus:outline-none"
              />
            </div>
          )}

          {activeTab === "rules" && (
            <div className="space-y-3">
              <p className="text-slate-300">
                Make sure your Cloud Firestore rules allow read and write for your electrical inventory collections:
              </p>
              <pre className="bg-[#11141B] p-3 rounded-xl border border-[#273142] text-[11px] font-mono text-amber-300 overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Set to true for initial testing
    }
  }
}`}
              </pre>
            </div>
          )}

          <div className="bg-[#13171F] p-3 rounded-xl border border-[#232B3B] text-[11px] text-slate-400 flex items-start gap-2">
            <Database className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <span>
              Even without Firebase keys right now, VoltFlow is fully operational using its local reactive database engine with pre-seeded electrical CCC data!
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232B3B] bg-[#13171F] flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
            Close
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold px-5 py-2 rounded-xl shadow-md cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save & Connect Firebase</span>
          </button>
        </div>

      </div>
    </div>
  );
}
