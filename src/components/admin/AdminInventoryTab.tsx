import React from "react";
import { Package, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Book } from "../../types";

interface AdminInventoryTabProps {
  books: Book[];
}

export default function AdminInventoryTab({ books }: AdminInventoryTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="font-serif text-lg text-[#F8F6F2] mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#C9A227]" />
          Physical Binding & Stock Status
        </h3>
        <div className="space-y-3">
          {books.slice(0, 10).map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
              <div>
                <p className="font-serif text-sm font-medium text-[#F8F6F2]">{b.title}</p>
                <p className="text-xs text-[#A5A5A5]">{b.author}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-[#C9A227]">{b.stock ?? 50} units</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-green-950/60 text-green-400 border border-green-800/40">
                  Optimal Stock
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}