import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/lib/types";
import { timeAgo, getConditionLabel } from "@/lib/utils";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listing/${listing.id}`} className="group">
      <article className="bg-white transition-all duration-300">
        <div className="relative aspect-[1/1] overflow-hidden rounded-[2rem] bg-[#F4F8FC] border border-[#D7E4F0]/30 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[#16324F]/5 group-hover:-translate-y-1">
          {listing.imageURLs[0] ? (
            <Image
              src={listing.imageURLs[0]}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-widest text-[#D7E4F0]">
              No Imagery
            </div>
          )}
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest text-[#16324F] shadow-sm">
              {getConditionLabel(listing.condition)}
            </span>
          </div>

          {listing.isSold && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-[#16324F] text-white text-[9px] font-bold px-4 py-2 rounded-lg tracking-[0.2em] uppercase">
                Sold
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 px-1">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-display font-bold text-[#16324F] leading-tight group-hover:text-[#4B9CD3] transition-colors truncate">
                {listing.title}
              </h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#6C849A]">
                {timeAgo(listing.createdAt)}
              </p>
            </div>
            <p className="text-lg font-bold text-[#16324F] pt-0.5">
              ${listing.price.toFixed(0)}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
