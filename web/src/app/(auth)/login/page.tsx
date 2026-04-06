"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { signIn, signUp, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 py-12 relative overflow-hidden bg-[#f4f8fc]">
      {/* Aesthetic Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand/5 rounded-full blur-[80px]" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[2.5rem] shadow-[0_20px_40px_rgba(22,50,79,0.08)] border border-border/40 mb-8 text-5xl transform transition-transform hover:scale-105 duration-500">
            🏛️
          </div>
          <h1 className="text-5xl font-display font-bold text-foreground tracking-tight">
            UNC Marketplace
          </h1>
          <p className="text-text-muted mt-4 font-medium text-lg">
            Buy & sell with fellow Tar Heels
          </p>
        </div>

        <div className="panel p-10 md:p-12 rounded-[3rem] backdrop-blur-xl bg-white/80 border-white/40 shadow-[0_32px_64px_rgba(22,50,79,0.06)]">
          <h2 className="text-2xl font-display font-bold mb-8 text-foreground text-center">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/70 ml-1">
                University Email
              </label>
              <input
                type="email"
                placeholder="youremail@unc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-muted/40 border border-border/60 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand focus:bg-white transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/70 ml-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-muted/40 border border-border/60 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand focus:bg-white transition-all duration-300"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 text-xs py-4 px-5 rounded-2xl text-center font-semibold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-deep text-white font-bold py-5 rounded-2xl shadow-[0_12px_24px_rgba(75,156,211,0.25)] transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 mt-4 text-sm tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="bg-transparent px-4 text-text-muted/40">or</span>
            </div>
          </div>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm font-bold text-brand hover:text-brand-deep transition-all duration-300"
          >
            {isSignUp
              ? "Already a member? Sign In"
              : "New to campus? Sign Up"}
          </button>
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted/50 max-w-[300px] mx-auto leading-relaxed">
            Exclusively for @unc.edu and related UNC Chapel Hill domains
          </p>
          <div className="flex justify-center gap-6">
            <div className="w-1 h-1 bg-brand/20 rounded-full"></div>
            <div className="w-1 h-1 bg-brand/20 rounded-full"></div>
            <div className="w-1 h-1 bg-brand/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
