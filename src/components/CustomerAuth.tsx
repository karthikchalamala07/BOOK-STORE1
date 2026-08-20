import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useBookstore } from "../context/useBookstore";
import { Mail, Lock, User, Check, Sparkles, ArrowRight, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";

interface CustomerAuthProps {
  initialMode?: "login" | "signup";
}

export default function CustomerAuth({ initialMode = "login" }: CustomerAuthProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerLogin, customerSignup, loginWithGoogle, currentUser } = useBookstore();

  const isLoginMode = location.pathname === "/login" || initialMode === "login";

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status & Validation States
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signedInSuccess, setSignedInSuccess] = useState(false);

  // If already logged in (non-guest), redirect to profile
  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous) {
      navigate("/profile");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Please fill in all credentials.");
      setLoading(false);
      return;
    }

    if (isLoginMode) {
      // CUSTOMER LOGIN
      const res = await customerLogin(email, password, rememberMe);
      setLoading(false);
      if (res.success) {
        navigate("/");
      } else {
        setErrorMsg(res.error || "Authentication failed. Please verify email and password.");
      }
    } else {
      // CUSTOMER SIGNUP
      if (!fullName) {
        setErrorMsg("Name field is required.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (!agreeToTerms) {
        setErrorMsg("Please read and accept the Terms & Conditions.");
        setLoading(false);
        return;
      }

      const res = await customerSignup(fullName, email, password);
      setLoading(false);
      if (res.success) {
        navigate("/");
      } else {
        setErrorMsg(res.error || "Failed to register new reader account.");
      }
    }
  };

    const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) {
      setSignedInSuccess(true);
      const returnUrl = (location.state as any)?.from?.pathname || sessionStorage.getItem("storyvault_return_url") || "/";
      sessionStorage.removeItem("storyvault_return_url");
      setTimeout(() => {
        navigate(returnUrl);
      }, 350);
    } else {
      setErrorMsg(res.error || "Google Sign-In failed.");
    }
  };

  const handleGuestContinue = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-radial-gold-glow pointer-events-none opacity-30" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="text-center">
          <Link to="/" className="font-serif text-3xl font-bold tracking-[0.2em] text-[#F8F6F2] hover:text-gold transition-colors duration-300">
            STORYVAULT
          </Link>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold block mt-2">
            Digital Preservation Codex
          </span>
          <h2 className="mt-8 font-serif text-2xl font-bold text-[#F8F6F2] tracking-wider">
            {isLoginMode ? "Sign in to your Library Vault" : "Register Preservation Account"}
          </h2>
          <p className="mt-2 text-xs text-[#A5A5A5] font-sans">
            {isLoginMode ? "Welcome back to your luxury digital sanctum." : "Join our timeless literary archives."}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="bg-[#151515] py-8 px-6 border border-customBorder rounded-xl shadow-2xl sm:px-10">
          
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/25 bg-red-950/20 text-red-400 text-xs font-mono flex items-start space-x-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <div>
                <label className="block text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A5A5A5]/60">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Alexander Dumas"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow transition-all duration-300 font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A5A5A5]/60">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@storyvault.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow transition-all duration-300 font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider">
                  Password
                </label>
                {isLoginMode && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset emails are active. Please check support.")}
                    className="text-[10px] font-mono text-gold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
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
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow transition-all duration-300 font-sans"
                />
              </div>
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A5A5A5]/60">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow transition-all duration-300 font-sans"
                  />
                </div>
              </div>
            )}

            {isLoginMode ? (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center ${rememberMe ? "bg-gold border-gold" : "bg-[#0C0C0C] border-customBorder"}`}>
                      {rememberMe && <Check size={10} className="text-background font-bold" />}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider">
                    Remember Me
                  </span>
                </label>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center ${agreeToTerms ? "bg-gold border-gold" : "bg-[#0C0C0C] border-customBorder"}`}>
                      {agreeToTerms && <Check size={10} className="text-background font-bold" />}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider leading-none">
                    I agree to Terms & Privacy Policy
                  </span>
                </label>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gold hover:bg-gold-hover disabled:bg-gold/40 text-background font-bold rounded-lg text-sm font-mono uppercase tracking-widest cursor-pointer flex items-center justify-center space-x-2 transition-colors duration-300"
              >
                {loading ? (
                  <Sparkles size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>{isLoginMode ? "Login" : "Create Account"}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Social Sign-In splits */}
          <div className="mt-8">
            <div className="relative flex justify-center text-xs font-mono uppercase tracking-wider text-[#A5A5A5]/60 mb-6">
              <span className="bg-[#151515] px-3 z-10">Or Sync Reader Vault</span>
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-customBorder z-0" />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-widest text-[#F8F6F2]">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="py-2.5 px-4 bg-[#0C0C0C] border border-customBorder hover:border-gold rounded-lg flex items-center justify-center space-x-2 cursor-pointer transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#C9A227]" />
                    <span className="text-xs text-[#C9A227] font-mono">Signing in...</span>
                  </>
                ) : signedInSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                    <span className="text-xs text-green-400 font-mono">Signed in</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleGuestContinue}
                disabled={loading}
                className="py-2.5 px-4 bg-[#0C0C0C] border border-customBorder hover:border-gold rounded-lg flex items-center justify-center space-x-2 cursor-pointer transition-colors duration-300"
              >
                <Sparkles size={12} className="text-gold" />
                <span>Guest</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs font-sans text-[#A5A5A5]">
            {isLoginMode ? (
              <>
                Don't have an archive credentials yet?{" "}
                <Link to="/signup" className="text-gold hover:underline font-mono">
                  Register
                </Link>
              </>
            ) : (
              <>
                Already have a preservation profile?{" "}
                <Link to="/login" className="text-gold hover:underline font-mono">
                  Sign In
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
