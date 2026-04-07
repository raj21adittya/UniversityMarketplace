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
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left: Auth Form */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white z-10">
        <div className="max-w-sm w-full">
          <div className="mb-12">
            <p className="font-display text-2xl font-bold text-[#16324F] tracking-tight mb-10">
              Marketplace<span className="text-[#4B9CD3]">.</span>
            </p>
            <h1 className="text-4xl font-display font-bold text-[#16324F] tracking-tight mb-3">
              {isSignUp ? "Join the community" : "Welcome back"}
            </h1>
            <p className="text-[#58708A] font-medium">
              {isSignUp 
                ? "The student marketplace for UNC Chapel Hill." 
                : "Sign in to browse and manage your listings."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#16324F]/60 ml-0.5">
                University Email
              </label>
              <input
                type="email"
                placeholder="you@unc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b-2 border-[#D7E4F0] focus:border-[#4B9CD3] outline-none py-3 text-base transition-all bg-transparent placeholder:text-[#D7E4F0]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#16324F]/60 ml-0.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b-2 border-[#D7E4F0] focus:border-[#4B9CD3] outline-none py-3 text-base transition-all bg-transparent placeholder:text-[#D7E4F0]"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16324F] hover:bg-[#1F4F7A] text-white font-bold py-4 rounded-full transition-all duration-300 active:scale-[0.98] disabled:opacity-50 mt-4 text-sm tracking-wide"
            >
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-[#F4F8FC] flex flex-col items-center gap-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-[#4B9CD3] hover:text-[#1F4F7A] transition-all"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Need an account? Sign Up"}
            </button>
            <p className="text-[10px] text-[#6C849A] font-medium tracking-wide uppercase">
              Exclusive to @unc.edu domains
            </p>
          </div>
        </div>
      </div>

      {/* Right: Minimalist Imagery */}
      <div className="hidden md:block w-[55%] relative bg-[#F4F8FC]">
        <img 
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200" 
          alt="Minimalist Furniture" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#16324F]/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] max-w-lg">
            <h2 className="text-3xl font-display font-bold mb-4 leading-tight">
              Furniture, textbooks, and more—refined for campus life.
            </h2>
            <p className="text-white/80 font-medium leading-relaxed">
              Join thousands of Tar Heels buying and selling essentials within the community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
