"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/constants";
import { Conversation } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function MessagesPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, COLLECTIONS.conversations),
      where("participantIDs", "array-contains", profile.id)
    );

    const unsub = onSnapshot(q, (snap) => {
      const convos = snap.docs
        .map((doc) => {
          const d = doc.data();
          return {
            ...d,
            id: doc.id,
            lastMessageAt: d.lastMessageAt?.toDate?.() ?? new Date(),
            createdAt: d.createdAt?.toDate?.() ?? new Date(),
          } as Conversation;
        })
        .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
      setConversations(convos);
      setLoading(false);
    });

    return unsub;
  }, [profile]);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-4 pb-24 md:px-8 md:pt-18">
      <h1 className="text-2xl font-bold text-[#13294B] mb-4">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium">No messages yet</p>
          <p className="text-sm mt-1">Message a seller to start a conversation</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((convo) => {
            const otherId = convo.participantIDs.find((id) => id !== profile?.id) ?? "";
            const otherName = convo.participantNames[otherId] ?? "User";
            const otherImage = convo.participantImages[otherId];

            return (
              <Link
                key={convo.id}
                href={`/messages/${convo.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {otherImage ? (
                  <Image
                    src={otherImage}
                    alt=""
                    width={48}
                    height={48}
                    className="rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-sm truncate">{otherName}</p>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {timeAgo(convo.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B9CD3] truncate">{convo.listingTitle}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {convo.lastMessage || "No messages yet"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
