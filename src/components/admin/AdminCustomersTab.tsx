import React, { useState } from "react";
import { Users, Search, ShieldCheck, Mail, Calendar } from "lucide-react";

export default function AdminCustomersTab() {
  const [searchQuery, setSearchQuery] = useState("");

  const sampleCustomers = [
    { id: "cust-1", name: "Lord Byron", email: "byron@literary.org", role: "Royal Patron", purchases: 14, joined: "2026-01-15" },
    { id: "cust-2", name: "Ada Lovelace", email: "ada@analytical.io", role: "Archival Scholar", purchases: 22, joined: "2026-02-01" },
    { id: "cust-3", name: "Mary Shelley", email: "mary@sanctuary.org", role: "Preservation Member", purchases: 9, joined: "2026-03-10" },
    { id: "cust-4", name: "Victor Hugo", email: "hugo@classicvault.fr", role: "Royal Patron", purchases: 18, joined: "2026-04-05" }
  ];

  const filtered = sampleCustomers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-[#A5A5A5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reader roster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg pl-9 pr-4 py-2 text-sm text-[#F8F6F2] focus:outline-none focus:border-[#C9A227]"
          />
        </div>
      </div>

      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-[#F8F6F2]">
          <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A] font-mono text-[#A5A5A5] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Reader Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Membership Tier</th>
              <th className="py-3 px-4">Preserved Purchases</th>
              <th className="py-3 px-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232323]">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-[#1A1A1A]/60 transition-colors">
                <td className="py-3 px-4 font-serif text-sm font-medium text-[#F8F6F2]">{c.name}</td>
                <td className="py-3 px-4 text-[#A5A5A5] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C9A227]" /> {c.email}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/30">
                    {c.role}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono">{c.purchases} classics</td>
                <td className="py-3 px-4 text-[#A5A5A5]">{c.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}