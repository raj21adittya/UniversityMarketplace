import { Listing } from "@/lib/types";
import ListingCard from "./listing-card";

export default function ListingGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="panel rounded-[28px] px-6 py-14 text-center text-[#58708A]">
        <p className="mb-3 text-4xl">🏷️</p>
        <p className="font-display text-2xl text-[#16324F]">Nothing here yet</p>
        <p className="mt-2 text-sm">Try another filter or check back for fresh campus listings.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
