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
      {/* Desktop top navbar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#4B9CD3]">
            UNC Marketplace
          </Link>
          <div className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-[#4B9CD3]"
                    : "text-gray-600 hover:text-[#4B9CD3]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-14">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-xs ${
                pathname === item.href ? "text-[#4B9CD3]" : "text-gray-500"
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
