"use client";

import { useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, CATEGORIES, CONDITIONS, LOCATIONS } from "@/lib/constants";
import { Listing } from "@/lib/types";
import ListingGrid from "@/components/listing-grid";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<Listing[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);

    const q = query(
      collection(db, COLLECTIONS.listings),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const snap = await getDocs(q);
    let listings = snap.docs
      .map((doc) => {
        const d = doc.data();
        return {
          ...d,
          id: doc.id,
          createdAt: d.createdAt?.toDate?.() ?? new Date(),
          updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
        } as Listing;
      })
      .filter((l) => l.isActive && !l.isSold);

    if (category) listings = listings.filter((l) => l.category === category);
    if (condition) listings = listings.filter((l) => l.condition === condition);
    if (location) listings = listings.filter((l) => l.locationTag === location);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      listings = listings.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }

    setResults(listings);
    setLoading(false);
  }

  return (
    <div className="bg-white min-h-screen pt-12 md:pt-24 pb-28">
      <div className="shell">
        <div className="max-w-3xl mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C849A] mb-3">Discovery</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#16324F] tracking-tight mb-4">
            Search the marketplace
          </h1>
          <p className="text-[#58708A] font-medium text-lg">
            Find exactly what you need from fellow students across campus.
          </p>
        </div>

        <div className="bg-[#F4F8FC] rounded-[2.5rem] p-6 md:p-10 mb-12 border border-[#D7E4F0]/50">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for furniture, books, or electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-[#D7E4F0] focus:border-[#4B9CD3] rounded-2xl px-6 py-4 text-lg text-[#16324F] outline-none transition-all pr-16 shadow-sm group-focus-within:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#16324F] text-white rounded-xl flex items-center justify-center hover:bg-[#1F4F7A] transition-colors shadow-lg shadow-[#16324F]/20"
              >
                🔍
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#16324F]/50 ml-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border-2 border-[#D7E4F0] rounded-xl px-4 py-3 text-sm text-[#16324F] outline-none focus:border-[#4B9CD3] transition-all cursor-pointer appearance-none shadow-sm"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#16324F]/50 ml-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-white border-2 border-[#D7E4F0] rounded-xl px-4 py-3 text-sm text-[#16324F] outline-none focus:border-[#4B9CD3] transition-all cursor-pointer appearance-none shadow-sm"
                >
                  <option value="">Any Condition</option>
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#16324F]/50 ml-1">Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border-2 border-[#D7E4F0] rounded-xl px-4 py-3 text-sm text-[#16324F] outline-none focus:border-[#4B9CD3] transition-all cursor-pointer appearance-none shadow-sm"
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        <div>
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-[#D7E4F0] border-t-[#4B9CD3] rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C849A]">Finding listings...</p>
            </div>
          ) : searched ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-display font-bold text-[#16324F]">Search Results</h3>
                <span className="text-[10px] font-bold text-[#6C849A] uppercase tracking-widest bg-[#F4F8FC] px-3 py-1 rounded-full border border-[#D7E4F0]/50">
                  {results.length} items
                </span>
              </div>
              <ListingGrid listings={results} />
            </>
          ) : (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-[#F4F8FC] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl">
                🔎
              </div>
              <h3 className="text-2xl font-display font-bold text-[#16324F] mb-2">Ready to explore?</h3>
              <p className="text-[#58708A] font-medium">Use the filters above to find exactly what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
