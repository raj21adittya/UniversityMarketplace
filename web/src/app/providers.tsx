"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/navbar";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname.startsWith("/login");
    const isSetupPage = pathname.startsWith("/setup");

    if (!user) {
      if (!isAuthPage) {
        router.replace("/login");
      }
    } else if (!profile || !profile.displayName) {
      if (!isSetupPage) {
        router.replace("/setup");
      }
    } else {
      if (isAuthPage || isSetupPage) {
        router.replace("/");
      }
    }
  }, [user, profile, loading, pathname, router]);

  // 1. Show loading while initializing or fetching profile
  const isSyncingProfile = user && !profile && !pathname.startsWith("/setup");
  if (loading || isSyncingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-sm font-medium text-text-muted animate-pulse">
          {loading ? "Initializing..." : "Syncing your profile..."}
        </p>
      </div>
    );
  }

  // 2. Strict rendering: Only render if the current route matches the auth state
  const isAuthPage = pathname.startsWith("/login");
  const isSetupPage = pathname.startsWith("/setup");

  // If not logged in, only allow Auth pages
  if (!user) {
    if (!isAuthPage) return null; // Wait for redirect to /login
    return <main>{children}</main>;
  }

  // If logged in but no profile, only allow Setup page
  if (!profile || !profile.displayName) {
    if (!isSetupPage) return null; // Wait for redirect to /setup
    return <main>{children}</main>;
  }

  // If fully logged in, don't allow Auth/Setup pages
  if (isAuthPage || isSetupPage) {
    return null; // Wait for redirect to /
  }

  // Fully authenticated and on a valid page
  return (
    <>
      <Navbar />
      <main className="md:pt-14 pb-14 md:pb-0">
        {children}
      </main>
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
