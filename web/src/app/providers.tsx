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
      if (!isAuthPage) router.replace("/login");
    } else if (!profile || !profile.displayName) {
      if (!isSetupPage) router.replace("/setup");
    } else {
      if (isAuthPage || isSetupPage) router.replace("/");
    }
  }, [user, profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <>
      {profile && profile.displayName && <Navbar />}
      <main className={profile && profile.displayName ? "md:pt-14 pb-14 md:pb-0" : ""}>
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
