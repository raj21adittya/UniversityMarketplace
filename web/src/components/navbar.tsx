"use client";

import Link from "next/link";
import Image from "next/image";
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
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-[#F4F8FC] bg-white/80 backdrop-blur-xl">
        <div className="shell h-[72px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center group">
              <p className="font-display text-xl font-bold text-[#16324F] tracking-tight transition-colors group-hover:text-[#4B9CD3]">
                Marketplace<span className="text-[#4B9CD3]">.</span>
              </p>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${
                  pathname === item.href
                    ? "text-[#16324F] border-b-2 border-[#16324F]"
                    : "text-[#6C849A] hover:text-[#16324F]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-3 pl-4 border-l border-[#F4F8FC]">
              <div className="text-right hidden lg:block">
                <p className="text-[11px] font-bold text-[#16324F] leading-none mb-1">{profile.displayName}</p>
                <p className="text-[9px] font-bold text-[#6C849A] uppercase tracking-widest">{profile.housingArea}</p>
              </div>
              {profile.profileImageURL ? (
                <Image
                  src={profile.profileImageURL}
                  alt=""
                  width={36}
                  height={32}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#F4F8FC]"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#F4F8FC] flex items-center justify-center text-sm border border-[#D7E4F0]/50">
                  {profile.displayName?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 rounded-3xl border border-[#D7E4F0]/30 bg-white/90 shadow-[0_20px_50px_rgba(22,50,79,0.12)] backdrop-blur-xl px-4 py-3">
        <div className="flex justify-around items-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center gap-1 transition-all ${
                pathname === item.href
                  ? "text-[#16324F] scale-110"
                  : "text-[#6C849A] opacity-60"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
