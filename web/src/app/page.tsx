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
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[65vh] min-h-[550px] flex items-center overflow-hidden bg-white">
        <img 
          src="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=2000" 
          alt="Scandinavian Minimalist Interior" 
          className="absolute inset-0 w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        
        <div className="shell relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4B9CD3]/10 border border-[#4B9CD3]/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4B9CD3] animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4F7A]">
                UNC Campus Exclusive
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.1] text-[#16324F] mb-6 tracking-tight">
              Better living, <br />
              <span className="text-[#4B9CD3]">shared on campus.</span>
            </h1>
            <p className="text-lg text-[#58708A] max-w-lg leading-relaxed mb-10 font-medium">
              A refined marketplace for Tar Heels to exchange furniture, essentials, and student finds.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#16324F]">{listings.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C849A]">Live Listings</span>
              </div>
              <div className="w-px h-10 bg-[#D7E4F0] mx-4"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#16324F]">UNC</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C849A]">Verified Only</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="sticky top-0 md:top-14 z-40 bg-white/80 backdrop-blur-xl border-b border-[#F4F8FC]">
        <div className="shell py-4">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                !selectedCategory
                  ? "bg-[#16324F] text-white shadow-lg shadow-[#16324F]/20"
                  : "bg-transparent text-[#58708A] hover:text-[#16324F]"
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
                className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === cat.value
                    ? "bg-[#16324F] text-white shadow-lg shadow-[#16324F]/20"
                    : "bg-transparent text-[#58708A] hover:text-[#16324F]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="shell py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-[#16324F]">
              {selectedCategory 
                ? CATEGORIES.find(c => c.value === selectedCategory)?.label 
                : "Recent Discoveries"}
            </h2>
            <div className="w-12 h-1 bg-[#4B9CD3] mt-2 rounded-full"></div>
          </div>
          <span className="text-xs font-bold text-[#6C849A] uppercase tracking-widest">
            {filtered.length} items found
          </span>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[#D7E4F0] border-t-[#4B9CD3] rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#6C849A]">Curating the feed...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-[2rem] text-center font-bold border border-red-100">
            {error}
          </div>
        ) : (
          <ListingGrid listings={filtered} />
        )}
      </main>
    </div>
  );
}
