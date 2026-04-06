"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, CATEGORIES } from "@/lib/constants";
import { Listing } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import ListingGrid from "@/components/listing-grid";

function docToListing(doc: { id: string; data: () => Record<string, unknown> }): Listing {
  const d = doc.data() as Record<string, unknown>;
  return {
    ...d,
    id: doc.id,
    createdAt: (d.createdAt as { toDate: () => Date })?.toDate?.() ?? new Date(),
    updatedAt: (d.updatedAt as { toDate: () => Date })?.toDate?.() ?? new Date(),
  } as Listing;
}

export default function HomePage() {
  const { profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const q = query(
        collection(db, COLLECTIONS.listings),
        orderBy("createdAt", "desc"),
        limit(40)
      );
      const snap = await getDocs(q);
      let results = snap.docs.map(docToListing).filter((l) => l.isActive && !l.isSold);
      // Hide own listings
      if (profile) {
        results = results.filter((l) => l.sellerID !== profile.id);
      }
      setListings(results);
      setLoading(false);
    }
    load();
  }, [profile]);

  const filtered = selectedCategory
    ? listings.filter((l) => l.category === selectedCategory)
    : listings;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-24 md:pt-18">
      <h1 className="text-2xl font-bold text-[#13294B] mb-4">UNC Marketplace</h1>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-[#4B9CD3] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat.value ? null : cat.value)
            }
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.value
                ? "bg-[#4B9CD3] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <ListingGrid listings={filtered} />
      )}
    </div>
  );
}
