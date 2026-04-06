"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, CATEGORIES } from "@/lib/constants";
import { Listing } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import ListingGrid from "@/components/listing-grid";

const HOME_PAGE_SIZE = 40;
const FETCH_BATCH_SIZE = 40;
const MAX_BATCHES = 5;

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const allResults: Listing[] = [];
        let lastDoc: QueryDocumentSnapshot<DocumentData> | undefined;

        for (let batch = 0; batch < MAX_BATCHES && allResults.length < HOME_PAGE_SIZE; batch += 1) {
          const q = lastDoc
            ? query(
                collection(db, COLLECTIONS.listings),
                orderBy("createdAt", "desc"),
                startAfter(lastDoc),
                limit(FETCH_BATCH_SIZE)
              )
            : query(
                collection(db, COLLECTIONS.listings),
                orderBy("createdAt", "desc"),
                limit(FETCH_BATCH_SIZE)
              );

          const snap = await getDocs(q);
          if (snap.empty) break;

          lastDoc = snap.docs[snap.docs.length - 1];

          const filteredBatch = snap.docs
            .map(docToListing)
            .filter((listing) => listing.isActive && !listing.isSold)
            .filter((listing) => !profile || listing.sellerID !== profile.id);

          allResults.push(...filteredBatch);

          if (snap.docs.length < FETCH_BATCH_SIZE) break;
        }

        setListings(allResults.slice(0, HOME_PAGE_SIZE));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listings.");
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [profile]);

  const filtered = selectedCategory
    ? listings.filter((listing) => listing.category === selectedCategory)
    : listings;

  return (
    <div className="shell pb-28 pt-4 md:pt-24">
      <section className="panel overflow-hidden rounded-[34px] p-5 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.5fr_0.8fr] md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#6C849A]">
              Carolina marketplace
            </p>
            <h1 className="font-display text-4xl leading-tight text-[#16324F] md:text-5xl">
              Buy, sell, and discover campus finds in UNC blue style.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#58708A] md:text-base">
              Browse recent student listings, filter by category, and keep the feed focused on the best active items around Chapel Hill.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[24px] bg-white px-4 py-5 shadow-[0_14px_30px_rgba(29,58,95,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6C849A]">Live</p>
              <p className="mt-3 text-3xl font-extrabold text-[#16324F]">{listings.length}</p>
              <p className="mt-1 text-sm text-[#58708A]">active picks</p>
            </div>
            <div className="rounded-[24px] bg-[#4B9CD3] px-4 py-5 text-white shadow-[0_18px_36px_rgba(75,156,211,0.28)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Focus</p>
              <p className="mt-3 text-3xl font-extrabold">{selectedCategory ? "1" : "All"}</p>
              <p className="mt-1 text-sm text-white/80">category view</p>
            </div>
            <div className="rounded-[24px] bg-[#16324F] px-4 py-5 text-white shadow-[0_18px_36px_rgba(22,50,79,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Campus</p>
              <p className="mt-3 text-3xl font-extrabold">UNC</p>
              <p className="mt-1 text-sm text-white/80">student-to-student</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="panel rounded-[30px] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-[#16324F]">Explore listings</h2>
              <p className="mt-1 text-sm text-[#58708A]">Familiar marketplace browsing, refined for campus.</p>
            </div>
            <div className="hidden rounded-full bg-[#DCEBFA] px-4 py-2 text-sm font-semibold text-[#1F4F7A] md:block">
              {filtered.length} shown
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                !selectedCategory
                  ? "bg-[#4B9CD3] text-white shadow-[0_12px_24px_rgba(75,156,211,0.26)]"
                  : "bg-[#EEF4F9] text-[#58708A] hover:bg-[#DCEBFA] hover:text-[#16324F]"
              }`}
            >
              All listings
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat.value ? null : cat.value)
                }
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                  selectedCategory === cat.value
                    ? "bg-[#4B9CD3] text-white shadow-[0_12px_24px_rgba(75,156,211,0.26)]"
                    : "bg-[#EEF4F9] text-[#58708A] hover:bg-[#DCEBFA] hover:text-[#16324F]"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        {loading ? (
          <div className="panel rounded-[30px] py-16 text-center text-[#6C849A]">Loading listings...</div>
        ) : error ? (
          <div className="panel rounded-[30px] py-16 text-center text-red-500">{error}</div>
        ) : (
          <ListingGrid listings={filtered} />
        )}
      </section>
    </div>
  );
}
