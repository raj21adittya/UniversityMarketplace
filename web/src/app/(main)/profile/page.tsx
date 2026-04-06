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
    <div className="shell pb-28 pt-4 md:pt-24">
      <div className="panel mb-6 rounded-[34px] p-6 md:p-8">
      <div className="text-center">
        {profile.profileImageURL ? (
          <Image
            src={profile.profileImageURL}
            alt=""
            width={92}
            height={92}
            className="mx-auto mb-4 h-[92px] w-[92px] rounded-full object-cover ring-4 ring-white shadow-[0_18px_36px_rgba(29,58,95,0.12)]"
          />
        ) : (
          <div className="mx-auto mb-4 h-[92px] w-[92px] rounded-full bg-[#D7E4F0]" />
        )}
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C849A]">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-[#16324F]">
          {profile.displayName}
          <span className="ml-1 text-[#4B9CD3]">✓</span>
        </h1>
        <p className="mt-2 text-sm text-[#58708A]">
          {profile.housingArea} · Class of {profile.graduationYear}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-[24px] bg-white px-4 py-4 shadow-[0_14px_30px_rgba(29,58,95,0.07)]">
            <p className="text-2xl font-extrabold text-[#16324F]">{profile.listingCount}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6C849A]">Listed</p>
          </div>
          <div className="rounded-[24px] bg-white px-4 py-4 shadow-[0_14px_30px_rgba(29,58,95,0.07)]">
            <p className="text-2xl font-extrabold text-[#16324F]">{profile.averageRating.toFixed(1)}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6C849A]">Rating</p>
          </div>
          <div className="rounded-[24px] bg-white px-4 py-4 shadow-[0_14px_30px_rgba(29,58,95,0.07)]">
            <p className="text-2xl font-extrabold text-[#16324F]">{profile.reviewCount}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6C849A]">Reviews</p>
          </div>
        </div>
      </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Link
          href="/sell"
          className="flex-1 rounded-2xl bg-[#4B9CD3] py-3 text-center text-sm font-semibold text-white shadow-[0_14px_28px_rgba(75,156,211,0.22)] hover:bg-[#3a8bc2]"
        >
          + New Listing
        </Link>
        <button
          onClick={signOut}
          className="flex-1 rounded-2xl bg-white py-3 text-center text-sm font-semibold text-[#58708A] shadow-[0_12px_24px_rgba(29,58,95,0.06)] hover:bg-[#EEF4F9]"
        >
          Sign Out
        </button>
      </div>

      {loading ? (
        <div className="panel rounded-[28px] py-8 text-center text-[#6C849A]">Loading...</div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-display text-2xl text-[#16324F]">Active Listings</h2>
              <span className="rounded-full bg-[#DCEBFA] px-3 py-1 text-sm font-semibold text-[#1F4F7A]">{activeListings.length} items</span>
            </div>
            <ListingGrid listings={activeListings} />
          </div>

          {soldListings.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-display text-2xl text-[#16324F]">Sold</h2>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#58708A] shadow-[0_10px_24px_rgba(29,58,95,0.05)]">{soldListings.length} items</span>
              </div>
              <div className="opacity-60">
                <ListingGrid listings={soldListings} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
