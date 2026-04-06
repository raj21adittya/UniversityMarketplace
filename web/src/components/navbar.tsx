"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/sell", label: "Sell", icon: "➕" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Navbar() {
  const { profile } = useAuth();
  const pathname = usePathname();

  if (!profile) return null;

  return (
    <>
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-white/70 bg-white/78 backdrop-blur-xl">
        <div className="shell h-[72px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4B9CD3] text-white shadow-[0_12px_24px_rgba(75,156,211,0.32)]">
                🏛️
              </div>
              <div>
                <p className="font-display text-[1.35rem] leading-none text-[#16324F]">UNC Marketplace</p>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C849A]">
                  Carolina finds
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#D7E4F0] bg-white/80 p-1 shadow-[0_10px_25px_rgba(29,58,95,0.06)]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  pathname === item.href
                    ? "bg-[#4B9CD3] text-white shadow-[0_10px_24px_rgba(75,156,211,0.28)]"
                    : "text-[#58708A] hover:bg-[#EEF4F9] hover:text-[#16324F]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-full border border-[#D7E4F0] bg-white/88 px-3 py-2 shadow-[0_10px_25px_rgba(29,58,95,0.06)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCEBFA] text-[#1F4F7A]">
              {profile.displayName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="max-w-40">
              <p className="truncate text-sm font-semibold text-[#16324F]">{profile.displayName}</p>
              <p className="truncate text-xs text-[#6C849A]">{profile.housingArea}</p>
            </div>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 rounded-[28px] border border-white/70 bg-white/88 px-2 py-2 shadow-[0_24px_60px_rgba(29,58,95,0.18)] backdrop-blur-xl pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="flex justify-around items-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                pathname === item.href
                  ? "bg-[#4B9CD3] text-white shadow-[0_10px_24px_rgba(75,156,211,0.28)]"
                  : "text-[#6C849A]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
