import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  KeyRound,
  Save,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/common/Badge";

export default function Profile() {
  const { currentUser, userProfile, userRole, logout, updateUserProfile, changePassword } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState(userProfile?.fullName || userProfile?.name || currentUser?.displayName || "Staff Member");
  const [phone, setPhone] = useState(userProfile?.phone || "+880 1700-000000");
  const [department, setDepartment] = useState(userProfile?.department || "Grid Substation Division");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState("");
  const [passErrorMsg, setPassErrorMsg] = useState("");

  // Keep state synchronized when user profile loads from Firestore
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.fullName || userProfile.name || currentUser?.displayName || "Staff Member");
      setPhone(userProfile.phone || "+880 1700-000000");
      setDepartment(userProfile.department || "Grid Substation Division");
    }
  }, [userProfile, currentUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMsg("");
    try {
      await updateUserProfile({
        fullName: name,
        phone,
        department
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassErrorMsg("");
    setPassSuccessMsg("");

    if (!newPassword || newPassword.length < 6) {
      setPassErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErrorMsg("New password and confirmation password do not match.");
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPassSuccessMsg("Password changed successfully! Your account security credentials have been updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccessMsg(""), 5000);
    } catch (err) {
      setPassErrorMsg(err.message || "Failed to update password.");
    } finally {
      setIsChangingPass(false);
    }
  };

  const displayName = userProfile?.fullName || userProfile?.name || currentUser?.displayName || "Staff Member";
  const displayEmail = userProfile?.email || currentUser?.email || "staff@voltflow.com";
  const displayBranch = userProfile?.branchName || "Assigned Substation";
  const displayRole = userRole || "Branch Engineer";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile & Account</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Personal identification, assigned site station, and role permissions.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <span>{errorMsg}</span>
        </div>
      )}

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes updated successfully.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center ring-4 ring-blue-500/20 shadow-md shadow-blue-900/20 shrink-0">
              {displayName[0] || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg text-slate-900">{displayName}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    displayRole === "Main Admin"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {displayRole}
                </span>
              </div>
              <p className="text-xs text-slate-500">{displayEmail}</p>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">{department}</p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className="text-xs text-slate-400">Assigned Substation Location:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{displayBranch}</span>
            </span>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleUpdate} className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={displayEmail}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdating ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Change Account Password</h2>
            <p className="text-xs text-slate-500">
              Update your account credentials. Choose a secure password with at least 6 characters.
            </p>
          </div>
        </div>

        {passErrorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passErrorMsg}</span>
          </div>
        )}

        {passSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (min. 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Secure credentials apply immediately across all authorized sessions.
            </span>
            <button
              type="submit"
              disabled={isChangingPass || !newPassword}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isChangingPass ? "Updating Password..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Access Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <KeyRound className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Security & Access Privileges</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400">Account Role:</span>
            <p className="font-bold text-slate-800 mt-0.5">{displayRole}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400">Two-Factor Authentication:</span>
            <p className="font-bold text-emerald-600 mt-0.5">Enforced (Corporate SSO)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400">Session Status:</span>
            <p className="font-bold text-blue-600 mt-0.5">Authenticated & Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
}
