import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBookstore } from "../context/useBookstore";
import { Shield, Mail, Lock, Check, Sparkles, AlertTriangle } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, currentAdmin } = useBookstore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to admin panel
  useEffect(() => {
    if (currentAdmin) {
      navigate("/admin");
    }
  }, [currentAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Administrator email and credentials are required.");
      setLoading(false);
      return;
    }

    const res = await adminLogin(email, password, rememberMe);
    setLoading(false);
    
    if (res.success) {
      navigate("/admin");
    } else {
      setErrorMsg(res.error || "Authentication failed. Access denied.");
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Structural background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-radial-gold-glow pointer-events-none opacity-20" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto shadow-gold-glow mb-4">
            <Shield size={24} className="text-gold" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-widest text-[#F8F6F2] uppercase">
            StoryVault CMS
          </h2>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold mt-1.5 block">
            Administrator Access Portal
          </span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="bg-[#121212] py-8 px-6 border border-[#2D2D2D] rounded-xl shadow-2xl sm:px-10">
          
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/25 bg-red-950/20 text-red-400 text-xs font-mono flex items-start space-x-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A5A5A5]/60">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="admin@storyvault.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090909] border border-[#2D2D2D] rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow transition-all duration-300 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A5A5A5]/60">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090909] border border-[#2D2D2D] rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow transition-all duration-300 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center ${rememberMe ? "bg-gold border-gold" : "bg-[#090909] border-[#2D2D2D]"}`}>
                    {rememberMe && <Check size={10} className="text-background font-bold" />}
                  </div>
                </div>
                <span className="text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider">
                  Remember Session
                </span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gold hover:bg-gold-hover disabled:bg-gold/40 text-background font-bold rounded-lg text-sm font-mono uppercase tracking-widest cursor-pointer flex items-center justify-center space-x-2 transition-colors duration-300 shadow-gold-glow/5"
              >
                {loading ? (
                  <Sparkles size={16} className="animate-spin" />
                ) : (
                  <span>Verify Credentials</span>
                )}
              </button>
            </div>
          </form>

          {/* Seeding credentials tip helper */}
          <div className="mt-8 pt-6 border-t border-[#2D2D2D]/60 text-left space-y-2">
            <span className="font-mono text-[8px] text-gold uppercase tracking-wider block font-bold">
              Preseded Test Accounts:
            </span>
            <div className="font-mono text-[8px] text-[#A5A5A5] leading-relaxed space-y-1 bg-[#090909] p-3 rounded border border-[#2D2D2D]/40">
              <p>• Super Admin: <span className="text-white">superadmin@storyvault.com</span> / <span className="text-gold">SuperAdmin123!</span></p>
              <p>• Content: <span className="text-white">content@storyvault.com</span> / <span className="text-gold">Content123!</span></p>
              <p>• Orders: <span className="text-white">orders@storyvault.com</span> / <span className="text-gold">Orders123!</span></p>
              <p>• Analytics: <span className="text-white">analytics@storyvault.com</span> / <span className="text-gold">Analytics123!</span></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
