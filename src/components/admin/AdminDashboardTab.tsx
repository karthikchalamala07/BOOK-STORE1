import React from "react";
import { Book, ShoppingBag, Users, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";

interface AdminDashboardTabProps {
  booksCount: number;
  ordersCount: number;
  customersCount: number;
  totalRevenue: number;
  onNavigateTab: (tab: string) => void;
}

export default function AdminDashboardTab({
  booksCount,
  ordersCount,
  customersCount,
  totalRevenue,
  onNavigateTab,
}: AdminDashboardTabProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#C9A227]/40 transition-colors">
          <div className="flex items-center justify-between text-[#C9A227] mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#A5A5A5]">Total Preserved</span>
            <Book className="w-5 h-5" />
          </div>
          <p className="font-serif text-3xl text-[#F8F6F2] font-semibold">{booksCount}</p>
          <span className="text-[11px] text-[#A5A5A5] mt-1 block">Public Domain Classics</span>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#C9A227]/40 transition-colors">
          <div className="flex items-center justify-between text-[#C9A227] mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#A5A5A5]">Total Orders</span>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="font-serif text-3xl text-[#F8F6F2] font-semibold">{ordersCount}</p>
          <span className="text-[11px] text-[#A5A5A5] mt-1 block">Preservation Purchases</span>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#C9A227]/40 transition-colors">
          <div className="flex items-center justify-between text-[#C9A227] mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#A5A5A5]">Registered Readers</span>
            <Users className="w-5 h-5" />
          </div>
          <p className="font-serif text-3xl text-[#F8F6F2] font-semibold">{customersCount}</p>
          <span className="text-[11px] text-[#A5A5A5] mt-1 block">Active Sanctuary Members</span>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#C9A227]/40 transition-colors">
          <div className="flex items-center justify-between text-[#C9A227] mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#A5A5A5]">Total Revenue</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="font-serif text-3xl text-[#C9A227] font-semibold">${totalRevenue.toFixed(2)}</p>
          <span className="text-[11px] text-[#A5A5A5] mt-1 block">Sanctuary Fund Balance</span>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg text-[#F8F6F2] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A227]" />
            Quick Archival Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateTab("Books")}
            className="p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg text-left hover:border-[#C9A227] transition-all group"
          >
            <Book className="w-5 h-5 text-[#C9A227] mb-2 group-hover:scale-110 transition-transform" />
            <span className="block font-medium text-sm text-[#F8F6F2]">Manage Books</span>
            <span className="text-xs text-[#A5A5A5]">Catalog & Preserves</span>
          </button>
          <button
            onClick={() => onNavigateTab("Orders")}
            className="p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg text-left hover:border-[#C9A227] transition-all group"
          >
            <ShoppingBag className="w-5 h-5 text-[#C9A227] mb-2 group-hover:scale-110 transition-transform" />
            <span className="block font-medium text-sm text-[#F8F6F2]">Review Orders</span>
            <span className="text-xs text-[#A5A5A5]">Dispatches & Receipts</span>
          </button>
          <button
            onClick={() => onNavigateTab("Customers")}
            className="p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg text-left hover:border-[#C9A227] transition-all group"
          >
            <Users className="w-5 h-5 text-[#C9A227] mb-2 group-hover:scale-110 transition-transform" />
            <span className="block font-medium text-sm text-[#F8F6F2]">Reader Roster</span>
            <span className="text-xs text-[#A5A5A5]">Customer Accounts</span>
          </button>
          <button
            onClick={() => onNavigateTab("Analytics")}
            className="p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg text-left hover:border-[#C9A227] transition-all group"
          >
            <TrendingUp className="w-5 h-5 text-[#C9A227] mb-2 group-hover:scale-110 transition-transform" />
            <span className="block font-medium text-sm text-[#F8F6F2]">View Analytics</span>
            <span className="text-xs text-[#A5A5A5]">Growth & Metrics</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-[#C9A227]/10 text-[#C9A227]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-serif text-base text-[#F8F6F2]">StoryVault Encryption & Preservation Node</h4>
            <p className="text-xs text-[#A5A5A5]">
              All classic manuscripts, receipts, and user libraries are cryptographically secured and active.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-green-950/60 border border-green-700/50 text-green-400 text-xs rounded-full font-mono whitespace-nowrap">
          ● Node Operational
        </span>
      </div>
    </div>
  );
}