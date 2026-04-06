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
    <div className="shell pb-28 pt-4 md:pt-24">
      <div className="panel rounded-[32px] p-5 md:p-7">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C849A]">Smart browse</p>
          <h1 className="font-display text-4xl text-[#16324F]">Search the marketplace</h1>
          <p className="mt-2 text-sm text-[#58708A]">
            Narrow listings by category, condition, and where students are meeting.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-2">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-2xl border border-[#D7E4F0] bg-white px-4 py-3 text-sm text-[#16324F] outline-none focus:border-[#4B9CD3] focus:ring-4 focus:ring-[#DCEBFA]"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#4B9CD3] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(75,156,211,0.22)] hover:bg-[#3a8bc2]"
          >
            Search
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-2xl border border-[#D7E4F0] bg-white px-4 py-3 text-sm text-[#16324F] outline-none"
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
            className="rounded-2xl border border-[#D7E4F0] bg-white px-4 py-3 text-sm text-[#16324F] outline-none"
          >
            <option value="">Any Condition</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-2xl border border-[#D7E4F0] bg-white px-4 py-3 text-sm text-[#16324F] outline-none"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        </form>
      </div>

      <div className="mt-6">
      {loading ? (
        <div className="panel rounded-[28px] py-16 text-center text-[#6C849A]">Searching...</div>
      ) : searched ? (
        <ListingGrid listings={results} />
      ) : (
        <div className="panel rounded-[28px] py-16 text-center text-[#58708A]">
          <p className="mb-3 text-4xl">🔍</p>
          <p className="font-display text-2xl text-[#16324F]">Search for items</p>
          <p className="mt-2 text-sm">Start with a keyword or browse by category and location.</p>
        </div>
      )}
      </div>
    </div>
  );
}
