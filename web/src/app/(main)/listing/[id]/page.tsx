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
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-28 md:pt-18">
      {/* Images */}
      <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-4">
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

      {/* Image thumbnails */}
      {listing.imageURLs.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {listing.imageURLs.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                i === currentImage ? "border-[#4B9CD3]" : "border-transparent"
              }`}
            >
              <Image src={url} alt="" width={64} height={64} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}

      {/* Title & Price */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
              {getConditionLabel(listing.condition)}
            </span>
            <span>{getLocationLabel(listing.locationTag)}</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-[#4B9CD3]">${listing.price.toFixed(0)}</p>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4">{listing.description}</p>

      <hr className="mb-4" />

      {/* Seller */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          {listing.sellerImageURL ? (
            <Image
              src={listing.sellerImageURL}
              alt=""
              width={44}
              height={44}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 bg-gray-200 rounded-full" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {listing.sellerName}
              <span className="ml-1 text-[#4B9CD3]">✓</span>
            </p>
            {seller && (
              <p className="text-xs text-gray-500">
                {seller.housingArea} · Class of {seller.graduationYear}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-gray-400 mb-6">
        <span>👁 {listing.viewCount} views</span>
        <span>❤️ {listing.savedCount} saved</span>
        <span>🕐 {timeAgo(listing.createdAt)}</span>
      </div>

      {/* Action button */}
      {!listing.isSold && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t p-4 z-40">
          <div className="max-w-3xl mx-auto">
            {isOwn ? (
              <button
                onClick={handleMarkAsSold}
                className="w-full bg-[#4B9CD3] text-white font-semibold py-3 rounded-xl hover:bg-[#3a8bc2] transition-colors"
              >
                Mark as Sold
              </button>
            ) : (
              <button
                onClick={handleMessageSeller}
                disabled={chatLoading}
                className="w-full bg-[#4B9CD3] text-white font-semibold py-3 rounded-xl hover:bg-[#3a8bc2] transition-colors disabled:opacity-50"
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
