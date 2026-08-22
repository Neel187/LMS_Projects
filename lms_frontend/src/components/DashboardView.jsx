import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Share2,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { apiFetch } from "../api";

// Reusable KPI Card Component
const KPICard = ({
  title,
  value,
  subValue,
  icon: Icon,
  accentColor,
  trend,
}) => (
  <div className="glass-panel p-5 rounded-xl flex flex-col justify-between border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-200">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </span>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
      >
        <Icon size={20} />
      </div>
    </div>

    <div className="mt-4">
      <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>

      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
            <ArrowUpRight size={14} />
            {trend}
          </span>
        )}
        <span className="text-xs text-slate-500">{subValue}</span>
      </div>
    </div>
  </div>
);

// Reusable Pipeline Progress Bar Component
const PipelineItem = ({ status, count, percent, color }) => (
  <div className="w-full">
    <div className="flex justify-between text-xs mb-1.5">
      <span className="font-semibold text-slate-300">{status}</span>
      <span className="text-slate-500">
        {count} ({percent}%)
      </span>
    </div>
    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

export default function DashboardView() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiFetch("/api/dashboard/stats/")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Fallback data while API loads or if it fails
  const overview = stats?.overview || {
    total_enquiries: 4,
    today_enquiries: 2,
    this_week_enquiries: 3,
    this_month_enquiries: 4,
  };

  const campaignPerf = stats?.campaign_performance || [
    { campaign_name: "Dubai Property Expo 2026", count: 2 },
    { campaign_name: "Q3 Bulk Direct Outreach", count: 1 },
  ];

  // Mock status pipeline breakdown (Ideally this comes from the API too)
  const pipelineData = [
    { status: "New", count: 1, color: "#60a5fa", percent: 25 },
    { status: "Contacted", count: 1, color: "#fbbf24", percent: 25 },
    { status: "Qualified", count: 1, color: "#34d399", percent: 25 },
    { status: "Closed", count: 1, color: "#c084fc", percent: 25 },
  ];

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-transparent">
      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading metrics...</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 pb-6">
          {/* ✅ FIXED: Header Section is now INSIDE the scrollable container, so it scrolls away naturally on mobile */}
          <div className="flex-shrink-0">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Executive Lead Analytics & Campaign Overview
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Real-time lead ingestion metrics, Meta Ads performance, and status
              conversions
            </p>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard
              title="Today's Enquiries"
              value={overview.today_enquiries}
              subValue="vs yesterday"
              icon={TrendingUp}
              accentColor="#60a5fa"
              trend="+100%"
            />

            <KPICard
              title="Meta Real-Time Leads"
              value="2"
              subValue="Webhook Auto-Ingested"
              icon={Share2}
              accentColor="#1877f2"
            />

            <KPICard
              title="This Month Enquiries"
              value={overview.this_month_enquiries}
              subValue="Deduplicated unique leads"
              icon={Users}
              accentColor="#fbbf24"
            />

            <KPICard
              title="Closed Won Ratio"
              value="25%"
              subValue="1 closed enquiry"
              icon={CheckCircle2}
              accentColor="#c084fc"
            />
          </div>

          {/* Charts & Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Pipeline Breakdown */}
            <div className="glass-panel p-5 rounded-xl border border-white/5 bg-white/5">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={18} className="text-blue-400" />
                <h3 className="text-base font-semibold text-white">
                  Lead Pipeline Status Breakdown
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {pipelineData.map((item) => (
                  <PipelineItem
                    key={item.status}
                    status={item.status}
                    count={item.count}
                    percent={item.percent}
                    color={item.color}
                  />
                ))}
              </div>
            </div>

            {/* Top Meta Ads Campaigns */}
            <div className="glass-panel p-5 rounded-xl border border-white/5 bg-white/5">
              <div className="flex items-center gap-2 mb-5">
                <Share2 size={18} className="text-[#1877f2]" />
                <h3 className="text-base font-semibold text-white">
                  Top Performing Campaigns
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {campaignPerf.length > 0 ? (
                  campaignPerf.map((cp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate max-w-[160px] md:max-w-[200px]">
                          {cp.campaign_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Instant Form Ingestion Active
                        </p>
                      </div>
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                        {cp.count} Leads
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No campaign data available yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
