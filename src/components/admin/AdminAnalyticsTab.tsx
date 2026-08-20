import React from "react";
import { TrendingUp, BarChart3, PieChart, ArrowUpRight } from "lucide-react";

export default function AdminAnalyticsTab() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-[#A5A5A5] uppercase">Monthly Growth</span>
            <span className="flex items-center text-xs text-green-400 font-mono"><ArrowUpRight className="w-3.5 h-3.5" /> +24.8%</span>
          </div>
          <p className="font-serif text-3xl text-[#F8F6F2] font-semibold">$14,280.00</p>
          <p className="text-xs text-[#A5A5A5] mt-1">Preservation Grants & Orders</p>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-[#A5A5A5] uppercase">Digital Vault Reads</span>
            <span className="flex items-center text-xs text-green-400 font-mono"><ArrowUpRight className="w-3.5 h-3.5" /> +18.2%</span>
          </div>
          <p className="font-serif text-3xl text-[#C9A227] font-semibold">1,842</p>
          <p className="text-xs text-[#A5A5A5] mt-1">Active Reader Codex Sessions</p>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-[#A5A5A5] uppercase">Retention Rate</span>
            <span className="flex items-center text-xs text-green-400 font-mono"><ArrowUpRight className="w-3.5 h-3.5" /> +94.1%</span>
          </div>
          <p className="font-serif text-3xl text-[#F8F6F2] font-semibold">96.4%</p>
          <p className="text-xs text-[#A5A5A5] mt-1">Repeat Patron Engagement</p>
        </div>
      </div>

      {/* Analytics Visualization Placeholder */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 space-y-4">
        <h3 className="font-serif text-lg text-[#F8F6F2] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#C9A227]" />
          Sanctuary Performance & Preserves Ranking
        </h3>
        <div className="h-48 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg flex items-center justify-center text-xs font-mono text-[#A5A5A5]">
          [ Interactive Revenue & Codex Analytics Chart Active ]
        </div>
      </div>
    </div>
  );
}