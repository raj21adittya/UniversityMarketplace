"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/constants";
import { Listing } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import ListingGrid from "@/components/listing-grid";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const q = query(
        collection(db, COLLECTIONS.listings),
        where("sellerID", "==", profile!.id)
      );
      const snap = await getDocs(q);
      const all = snap.docs
        .map((doc) => {
          const d = doc.data();
          return {
            ...d,
            id: doc.id,
            createdAt: d.createdAt?.toDate?.() ?? new Date(),
            updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
          } as Listing;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setActiveListings(all.filter((l) => !l.isSold));
      setSoldListings(all.filter((l) => l.isSold));
      setLoading(false);
    }
    load();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="bg-white min-h-screen pt-12 md:pt-24 pb-28">
      <div className="shell">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-[#F4F8FC] rounded-[3rem] p-10 md:p-16 mb-12 border border-[#D7E4F0]/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4B9CD3]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                {profile.profileImageURL ? (
                  <Image
                    src={profile.profileImageURL}
                    alt={profile.displayName}
                    width={140}
                    height={140}
                    className="w-32 h-32 md:w-[140px] md:h-[140px] rounded-full object-cover ring-8 ring-white shadow-xl shadow-[#16324F]/5 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-[140px] md:h-[140px] rounded-full bg-white flex items-center justify-center text-4xl ring-8 ring-white shadow-xl shadow-[#16324F]/5">
                    👤
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-[#4B9CD3] text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  ✓
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6C849A] mb-3">Community Member</p>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-[#16324F] tracking-tight mb-4">
                  {profile.displayName}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[#58708A] font-medium">
                  <span className="flex items-center gap-1.5">
                    📍 {profile.housingArea}
                  </span>
                  <span className="hidden md:inline text-[#D7E4F0]">|</span>
                  <span className="flex items-center gap-1.5">
                    🎓 Class of {profile.graduationYear}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link
                  href="/sell"
                  className="bg-[#16324F] hover:bg-[#1F4F7A] text-white font-bold py-4 px-8 rounded-full text-center transition-all shadow-lg shadow-[#16324F]/10 text-sm tracking-wide"
                >
                  Create Listing
                </Link>
                <button
                  onClick={signOut}
                  className="bg-white hover:bg-[#EEF4F9] text-[#58708A] font-bold py-4 px-8 rounded-full text-center border border-[#D7E4F0] transition-all text-sm tracking-wide"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t border-[#D7E4F0]/50">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#16324F] mb-1">{profile.listingCount}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#6C849A]">Items Listed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#16324F] mb-1">{profile.averageRating.toFixed(1)}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#6C849A]">Avg Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#16324F] mb-1">{profile.reviewCount}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#6C849A]">Total Reviews</p>
              </div>
            </div>
          </div>

          {/* Listings Sections */}
          <div className="space-y-20">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-2 border-[#D7E4F0] border-t-[#4B9CD3] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C849A]">Loading your listings...</p>
              </div>
            ) : (
              <>
                <section>
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-[#16324F]">Active Listings</h2>
                      <div className="w-12 h-1 bg-[#4B9CD3] mt-2 rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#6C849A] uppercase tracking-widest bg-[#F4F8FC] px-3 py-1 rounded-full border border-[#D7E4F0]/50">
                      {activeListings.length} active
                    </span>
                  </div>
                  {activeListings.length > 0 ? (
                    <ListingGrid listings={activeListings} />
                  ) : (
                    <div className="bg-[#F4F8FC] rounded-3xl p-12 text-center border-2 border-dashed border-[#D7E4F0]">
                      <p className="text-[#58708A] font-medium">You don't have any active listings yet.</p>
                    </div>
                  )}
                </section>

                {soldListings.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-2xl font-display font-bold text-[#16324F]">Sales History</h2>
                        <div className="w-12 h-1 bg-[#6C849A]/30 mt-2 rounded-full"></div>
                      </div>
                      <span className="text-[10px] font-bold text-[#6C849A] uppercase tracking-widest">
                        {soldListings.length} sold
                      </span>
                    </div>
                    <div className="opacity-60 grayscale-[0.5]">
                      <ListingGrid listings={soldListings} />
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
