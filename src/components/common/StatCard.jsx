import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  iconBg = "bg-blue-50 text-blue-600 border-blue-100",
  onClick
}) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-blue-300" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${iconBg} shadow-xs`}>
          {Icon && <Icon className="w-5 h-5 lg:w-6 lg:h-6" />}
        </div>
      </div>

      {(subtitle || trendValue) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {trendValue && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                isPositive ? "text-emerald-600" : isNegative ? "text-rose-600" : "text-slate-500"
              }`}
            >
              {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
              {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
              {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
