import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeNames = {
  products: "Products",
  categories: "Categories",
  branches: "All Branches",
  "branch-inventory": "Branch Inventory",
  "stock-transfer": "Stock Transfer",
  "transfer-history": "Transfer History",
  "stock-movements": "Stock Movement History",
  "low-stock": "Low Stock Alerts",
  users: "Users & Access",
  reports: "Reports & Analytics",
  settings: "Settings",
  profile: "My Profile"
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) {
    return (
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <Home className="w-3.5 h-3.5 text-blue-600" />
          <span>Dashboard Overview</span>
        </span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 flex-wrap">
      <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Dashboard</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[name] || decodeURIComponent(name);

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 capitalize">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-blue-600 transition-colors capitalize">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
