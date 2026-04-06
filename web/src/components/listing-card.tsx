import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/lib/types";
import { timeAgo, getConditionLabel } from "@/lib/utils";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listing/${listing.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
        <div className="relative aspect-[4/3] bg-gray-100">
          {listing.imageURLs[0] ? (
            <Image
              src={listing.imageURLs[0]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <span className="absolute top-2 right-2 bg-white/90 text-xs font-medium px-2 py-0.5 rounded-full">
            {getConditionLabel(listing.condition)}
          </span>
          {listing.isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                SOLD
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate group-hover:text-[#4B9CD3] transition-colors">
            {listing.title}
          </h3>
          <p className="text-[#4B9CD3] font-bold text-lg">${listing.price.toFixed(0)}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {listing.sellerImageURL ? (
              <Image
                src={listing.sellerImageURL}
                alt=""
                width={16}
                height={16}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-4 h-4 bg-gray-200 rounded-full" />
            )}
            <span className="text-xs text-gray-500 truncate">{listing.sellerName}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{timeAgo(listing.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
}
