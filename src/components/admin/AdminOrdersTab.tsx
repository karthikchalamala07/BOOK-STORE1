import React, { useState, useMemo } from "react";
import { Search, CheckCircle, Clock, Key, Tag } from "lucide-react";

interface AdminOrdersTabProps {
  receipts: any[];
}

export default function AdminOrdersTab({ receipts }: AdminOrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("All");

  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const matchSearch =
        (r.receiptNumber || r.orderId || r.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.customerName || r.customerEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.digitalAccessCode || "").toLowerCase().includes(searchQuery.toLowerCase());
      const itemFormats = (r.books || r.items || []).map((i: any) => i.format || "digital");
      const matchFormat = formatFilter === "All" || itemFormats.includes(formatFilter);
      return matchSearch && matchFormat;
    });
  }, [receipts, searchQuery, formatFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-[#A5A5A5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by receipt #, customer, or access code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg pl-9 pr-4 py-2 text-sm text-[#F8F6F2] focus:outline-none focus:border-[#C9A227]"
          />
        </div>
        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-xs text-[#F8F6F2] focus:outline-none focus:border-[#C9A227]"
        >
          <option value="All">All Formats</option>
          <option value="ebook">Digital eBook</option>
          <option value="digital">Digital</option>
          <option value="physical">Hardcover / Paperback</option>
        </select>
      </div>

      {/* Receipts & Entitlements Ledger */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F8F6F2]">
            <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A] font-mono text-[#A5A5A5] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID & Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Purchased Items</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Digital Entitlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232323]">
              {filteredReceipts.map((r) => {
                const items = r.books || r.items || [];
                const hasDigital = items.some((i: any) => i.format === "ebook" || i.format === "digital" || i.format === "combo");
                const code = r.digitalAccessCode || items.find((i: any) => i.digitalAccessCode)?.digitalAccessCode || "SV-7JZVFZ";

                return (
                  <tr key={r.receiptNumber || r.orderId || r.id} className="hover:bg-[#1A1A1A]/60 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <p className="text-[#C9A227] font-medium">{r.receiptNumber || r.orderId || `SV-${r.id}`}</p>
                      {hasDigital && (
                        <p className="text-[10px] text-[#A5A5A5] flex items-center gap-1 mt-0.5">
                          <Key className="w-3 h-3 text-[#C9A227]" /> {code}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#F8F6F2]">{r.customerName || "Patron Reader"}</p>
                      <p className="text-[11px] text-[#A5A5A5]">{r.customerEmail || "reader@storyvault.com"}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-serif text-sm text-[#F8F6F2]">
                        {items[0]?.title || r.bookTitle || "Classic preserved edition"}
                      </p>
                      {items.length > 1 && (
                        <p className="text-[10px] text-[#A5A5A5] font-mono">+ {items.length - 1} additional items</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-[#C9A227] border border-[#C9A227]/30 uppercase">
                        <Tag className="w-3 h-3" /> {items[0]?.format || r.bookType || "Digital eBook"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-green-950/60 text-green-400 border border-green-700/40">
                        <CheckCircle className="w-3 h-3" /> PAID
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {hasDigital ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/40">
                          <CheckCircle className="w-3 h-3" /> ACTIVE ENTITLEMENT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                          PHYSICAL ONLY
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#A5A5A5] font-serif">
                    No orders or digital entitlements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}