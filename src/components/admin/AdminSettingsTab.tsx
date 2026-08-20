import React from "react";
import { Settings, Shield, Key, Save } from "lucide-react";

export default function AdminSettingsTab() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 space-y-6">
        <h3 className="font-serif text-lg text-[#F8F6F2] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#C9A227]" />
          Sanctuary Platform Configuration
        </h3>

        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-mono uppercase text-[#A5A5A5] mb-1">
              Sanctuary Archive Name
            </label>
            <input
              type="text"
              defaultValue="STORYVAULT Literary Archive"
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-4 py-2 text-sm text-[#F8F6F2] focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#A5A5A5] mb-1">
              Default Currency
            </label>
            <input
              type="text"
              defaultValue="USD ($)"
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-4 py-2 text-sm text-[#F8F6F2] focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A227] text-[#0D0D0D] font-medium text-xs rounded-lg hover:bg-[#b08d20] transition-colors">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}