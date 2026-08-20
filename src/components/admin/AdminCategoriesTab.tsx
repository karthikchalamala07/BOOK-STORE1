import React from "react";
import { Folder, Layers } from "lucide-react";

export default function AdminCategoriesTab() {
  const categories = [
    { name: "Gothic Horror", count: 8, description: "Dark Victorian thrillers and immortal legends." },
    { name: "Romance & Society", count: 7, description: "Classic social commentary and timeless love stories." },
    { name: "Mystery & Detective", count: 9, description: "Analytical deduction and Victorian crimes." },
    { name: "Epic & Philosophy", count: 12, description: "Ancient mythologies and foundational philosophy." }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div key={cat.name} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#C9A227]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif text-lg text-[#F8F6F2] font-semibold">{cat.name}</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A5A5A5] border border-[#2E2E2E]">
                {cat.count} Titles
              </span>
            </div>
            <p className="text-xs text-[#A5A5A5]">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}