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
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-24 md:pt-18">
      <h1 className="text-2xl font-bold text-[#13294B] mb-4">Search</h1>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
          />
          <button
            type="submit"
            className="bg-[#4B9CD3] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3a8bc2] transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Any Condition</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Searching...</div>
      ) : searched ? (
        <ListingGrid listings={results} />
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>Search for items</p>
        </div>
      )}
    </div>
  );
}
