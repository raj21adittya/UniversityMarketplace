import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/lib/types";
import { timeAgo, getConditionLabel } from "@/lib/utils";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listing/${listing.id}`} className="group">
      <article className="overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_18px_44px_rgba(29,58,95,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(29,58,95,0.14)]">
        <div className="relative aspect-[1/1] bg-[#EAF1F7]">
          {listing.imageURLs[0] ? (
            <Image
              src={listing.imageURLs[0]}
              alt={listing.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#7A92A8]">
              No Image
            </div>
          )}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#14304d]/24 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#1F4F7A] uppercase shadow-sm">
            {getConditionLabel(listing.condition)}
          </span>
          {listing.isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold text-white">
                SOLD
              </span>
            </div>
          )}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6C849A]">
                {timeAgo(listing.createdAt)}
              </p>
              <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-5 text-[#16324F] group-hover:text-[#1F4F7A]">
                {listing.title}
              </h3>
            </div>
            <p className="shrink-0 text-xl font-extrabold text-[#4B9CD3]">${listing.price.toFixed(0)}</p>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-[#F4F8FC] px-3 py-2">
            {listing.sellerImageURL ? (
              <Image
                src={listing.sellerImageURL}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-[#D7E4F0]" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#16324F]">{listing.sellerName}</p>
              <p className="truncate text-xs text-[#6C849A]">Campus seller</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6C849A]">
            <span className="rounded-full bg-[#DCEBFA] px-2.5 py-1 font-semibold text-[#1F4F7A]">
              View listing
            </span>
            <span className="font-medium group-hover:text-[#4B9CD3]">Open</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
