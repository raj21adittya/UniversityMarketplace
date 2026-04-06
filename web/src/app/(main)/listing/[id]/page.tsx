"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/constants";
import { Listing, UMUser, Conversation } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { getConditionLabel, getLocationLabel, timeAgo } from "@/lib/utils";
import Image from "next/image";
import { collection, query, where, getDocs, setDoc } from "firebase/firestore";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<UMUser | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, COLLECTIONS.listings, id));
      if (!snap.exists()) return;
      const d = snap.data();
      const l: Listing = {
        ...d,
        id: snap.id,
        createdAt: d.createdAt?.toDate?.() ?? new Date(),
        updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
      } as Listing;
      setListing(l);

      // Fetch seller
      const sellerSnap = await getDoc(doc(db, COLLECTIONS.users, l.sellerID));
      if (sellerSnap.exists()) {
        const sd = sellerSnap.data();
        setSeller({
          ...sd,
          id: sellerSnap.id,
          createdAt: sd.createdAt?.toDate?.() ?? new Date(),
          updatedAt: sd.updatedAt?.toDate?.() ?? new Date(),
        } as UMUser);
      }

      // Increment view
      await updateDoc(doc(db, COLLECTIONS.listings, id), {
        viewCount: increment(1),
      }).catch(() => {});

      setLoading(false);
    }
    load();
  }, [id]);

  async function handleMessageSeller() {
    if (!profile || !listing) return;
    setChatLoading(true);

    try {
      // Check for existing conversation
      const sorted = [profile.id, listing.sellerID].sort();
      const q = query(
        collection(db, COLLECTIONS.conversations),
        where("participantIDs", "==", sorted),
        where("listingID", "==", listing.id)
      );
      const snap = await getDocs(q);

      let conversationId: string;
      if (!snap.empty) {
        conversationId = snap.docs[0].id;
      } else {
        conversationId = crypto.randomUUID();
        const convo: Conversation = {
          id: conversationId,
          participantIDs: sorted,
          listingID: listing.id,
          listingTitle: listing.title,
          listingImageURL: listing.imageURLs[0] ?? undefined,
          listingPrice: listing.price,
          lastMessage: "",
          lastMessageAt: new Date(),
          lastSenderID: profile.id,
          participantNames: {
            [profile.id]: profile.displayName,
            [listing.sellerID]: listing.sellerName,
          },
          participantImages: {
            ...(profile.profileImageURL ? { [profile.id]: profile.profileImageURL } : {}),
            ...(listing.sellerImageURL ? { [listing.sellerID]: listing.sellerImageURL } : {}),
          },
          createdAt: new Date(),
        };
        await setDoc(doc(db, COLLECTIONS.conversations, conversationId), convo);
      }
      router.push(`/messages/${conversationId}`);
    } catch (e) {
      console.error("Failed to start chat:", e);
    }
    setChatLoading(false);
  }

  async function handleMarkAsSold() {
    if (!listing) return;
    await updateDoc(doc(db, COLLECTIONS.listings, listing.id), {
      isSold: true,
      isActive: false,
      updatedAt: new Date(),
    });
    setListing({ ...listing, isSold: true, isActive: false });
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;
  if (!listing) return <div className="text-center py-16 text-gray-500">Listing not found</div>;

  const isOwn = profile?.id === listing.sellerID;

  return (
    <div className="shell pb-32 pt-4 md:pt-24">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div>
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[30px] bg-[#EAF1F7] shadow-[0_20px_48px_rgba(29,58,95,0.1)]">
        {listing.imageURLs.length > 0 ? (
          <Image
            src={listing.imageURLs[currentImage]}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
            No Image
          </div>
        )}
        {listing.isSold && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xl font-bold px-5 py-2 rounded-full">
              SOLD
            </span>
          </div>
        )}
      </div>

      {listing.imageURLs.length > 1 && (
        <div className="mb-4 flex gap-3 overflow-x-auto">
          {listing.imageURLs.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 ${
                i === currentImage ? "border-[#4B9CD3]" : "border-white"
              }`}
            >
              <Image src={url} alt="" width={64} height={64} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}

      <div className="panel rounded-[30px] p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6C849A]">Listing details</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-[#16324F]">{listing.title}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-[#58708A]">
            <span className="rounded-full bg-[#EEF4F9] px-3 py-1 text-xs font-semibold">
              {getConditionLabel(listing.condition)}
            </span>
            <span>{getLocationLabel(listing.locationTag)}</span>
          </div>
        </div>
        <p className="rounded-full bg-[#DCEBFA] px-4 py-2 text-2xl font-extrabold text-[#1F4F7A]">${listing.price.toFixed(0)}</p>
      </div>

      <p className="mb-4 text-[15px] leading-7 text-[#58708A]">{listing.description}</p>

      <div className="mb-5 h-px bg-[#E1EAF2]" />

      <div className="rounded-[24px] bg-[#F4F8FC] p-4">
        <div className="flex items-center gap-3">
          {listing.sellerImageURL ? (
            <Image
              src={listing.sellerImageURL}
              alt=""
              width={44}
              height={44}
              className="rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-[#D7E4F0]" />
          )}
          <div>
            <p className="text-sm font-semibold text-[#16324F]">
              {listing.sellerName}
              <span className="ml-1 text-[#4B9CD3]">✓</span>
            </p>
            {seller && (
              <p className="text-xs text-[#58708A]">
                {seller.housingArea} · Class of {seller.graduationYear}
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
      </div>

      <div className="panel h-fit rounded-[30px] p-6 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C849A]">Marketplace signals</p>
        <div className="mt-5 grid gap-3">
          <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(29,58,95,0.06)]">
            <p className="text-2xl font-extrabold text-[#16324F]">{listing.viewCount}</p>
            <p className="text-sm text-[#58708A]">views</p>
          </div>
          <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(29,58,95,0.06)]">
            <p className="text-2xl font-extrabold text-[#16324F]">{listing.savedCount}</p>
            <p className="text-sm text-[#58708A]">saved by shoppers</p>
          </div>
          <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(29,58,95,0.06)]">
            <p className="text-lg font-bold text-[#16324F]">{timeAgo(listing.createdAt)}</p>
            <p className="text-sm text-[#58708A]">posted</p>
          </div>
        </div>
      </div>
      </div>

      {!listing.isSold && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-white/80 bg-white/82 p-4 backdrop-blur-xl md:bottom-0">
          <div className="shell max-w-3xl">
            {isOwn ? (
              <button
                onClick={handleMarkAsSold}
                className="w-full rounded-2xl bg-[#4B9CD3] py-3.5 font-semibold text-white shadow-[0_14px_28px_rgba(75,156,211,0.22)] hover:bg-[#3a8bc2]"
              >
                Mark as Sold
              </button>
            ) : (
              <button
                onClick={handleMessageSeller}
                disabled={chatLoading}
                className="w-full rounded-2xl bg-[#4B9CD3] py-3.5 font-semibold text-white shadow-[0_14px_28px_rgba(75,156,211,0.22)] hover:bg-[#3a8bc2] disabled:opacity-50"
              >
                {chatLoading ? "Opening Chat..." : "Message Seller"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
