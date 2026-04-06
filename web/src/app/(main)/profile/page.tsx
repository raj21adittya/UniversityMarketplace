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
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 md:pt-18">
      {/* Profile Header */}
      <div className="text-center mb-6">
        {profile.profileImageURL ? (
          <Image
            src={profile.profileImageURL}
            alt=""
            width={80}
            height={80}
            className="rounded-full object-cover mx-auto mb-3"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3" />
        )}
        <h1 className="text-xl font-bold">
          {profile.displayName}
          <span className="ml-1 text-[#4B9CD3]">✓</span>
        </h1>
        <p className="text-sm text-gray-500">
          {profile.housingArea} · Class of {profile.graduationYear}
        </p>
        <div className="flex justify-center gap-8 mt-3 text-sm">
          <div className="text-center">
            <p className="font-bold">{profile.listingCount}</p>
            <p className="text-gray-500 text-xs">Listed</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{profile.averageRating.toFixed(1)}</p>
            <p className="text-gray-500 text-xs">Rating</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{profile.reviewCount}</p>
            <p className="text-gray-500 text-xs">Reviews</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Link
          href="/sell"
          className="flex-1 text-center bg-[#4B9CD3] text-white font-medium py-2.5 rounded-xl text-sm hover:bg-[#3a8bc2] transition-colors"
        >
          + New Listing
        </Link>
        <button
          onClick={signOut}
          className="flex-1 text-center bg-gray-100 text-gray-700 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Active Listings */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Active Listings</h2>
              <span className="text-sm text-gray-500">{activeListings.length} items</span>
            </div>
            <ListingGrid listings={activeListings} />
          </div>

          {/* Sold Listings */}
          {soldListings.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Sold</h2>
                <span className="text-sm text-gray-500">{soldListings.length} items</span>
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
