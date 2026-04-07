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
    <div className="bg-white min-h-screen pt-12 md:pt-24 pb-32">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1fr_450px]">
          {/* Left: Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-[#F4F8FC] border border-[#D7E4F0]/50 shadow-sm">
              {listing.imageURLs.length > 0 ? (
                <Image
                  src={listing.imageURLs[currentImage]}
                  alt={listing.title}
                  fill
                  className="object-cover transition-all duration-700 ease-in-out"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#D7E4F0] gap-4">
                  <span className="text-6xl">🖼️</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-[#6C849A]">No imagery provided</span>
                </div>
              )}
              {listing.isSold && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-[#16324F] text-white text-xs font-bold px-6 py-2.5 rounded-full tracking-[0.2em] uppercase shadow-xl">
                    Closed / Sold
                  </span>
                </div>
              )}
            </div>

            {listing.imageURLs.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {listing.imageURLs.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 ${
                      i === currentImage 
                        ? "ring-2 ring-[#4B9CD3] ring-offset-2 scale-95" 
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="pt-8 border-t border-[#F4F8FC]">
              <div className="max-w-2xl">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#6C849A] mb-6">Provenance & Details</h2>
                <p className="text-[#58708A] text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Info Sidebar */}
          <div className="space-y-8">
            <div className="bg-[#F4F8FC] rounded-[3rem] p-10 border border-[#D7E4F0]/50 sticky top-24 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-white border border-[#D7E4F0] text-[9px] font-bold uppercase tracking-widest text-[#1F4F7A]">
                      {getConditionLabel(listing.condition)}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-[#D7E4F0] text-[9px] font-bold uppercase tracking-widest text-[#1F4F7A]">
                      {getLocationLabel(listing.locationTag)}
                    </span>
                  </div>
                  <h1 className="text-3xl font-display font-bold text-[#16324F] leading-tight">
                    {listing.title}
                  </h1>
                </div>
                <div className="text-3xl font-bold text-[#4B9CD3] pt-1">
                  ${listing.price.toFixed(0)}
                </div>
              </div>

              <div className="space-y-10">
                {/* Seller Info */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#D7E4F0]/30">
                  {listing.sellerImageURL ? (
                    <Image
                      src={listing.sellerImageURL}
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-full object-cover ring-2 ring-[#F4F8FC]"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-[#D7E4F0] flex items-center justify-center text-xl">👤</div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-[#16324F]">
                      {listing.sellerName} <span className="text-[#4B9CD3] ml-0.5">✓</span>
                    </p>
                    {seller && (
                      <p className="text-[10px] font-bold text-[#6C849A] uppercase tracking-widest">
                        Class of {seller.graduationYear}
                      </p>
                    )}
                  </div>
                </div>

                {/* Signals */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4">
                    <p className="text-xl font-bold text-[#16324F]">{listing.viewCount}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#6C849A]">Interactions</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-xl font-bold text-[#16324F]">{timeAgo(listing.createdAt)}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#6C849A]">Listed</p>
                  </div>
                </div>

                {/* CTA */}
                {!listing.isSold && (
                  <div className="pt-4">
                    {isOwn ? (
                      <button
                        onClick={handleMarkAsSold}
                        className="w-full bg-[#16324F] hover:bg-[#1F4F7A] text-white font-bold py-5 rounded-full transition-all shadow-lg shadow-[#16324F]/10 tracking-widest uppercase text-[11px]"
                      >
                        Mark as Sold
                      </button>
                    ) : (
                      <button
                        onClick={handleMessageSeller}
                        disabled={chatLoading}
                        className="w-full bg-[#16324F] hover:bg-[#1F4F7A] text-white font-bold py-5 rounded-full transition-all shadow-lg shadow-[#16324F]/10 tracking-widest uppercase text-[11px] flex items-center justify-center gap-3"
                      >
                        {chatLoading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Inquire with Seller"
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
