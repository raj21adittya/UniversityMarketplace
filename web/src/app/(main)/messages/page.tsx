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
    <div className="bg-white min-h-screen pt-12 md:pt-24 pb-28">
      <div className="shell max-w-3xl">
        <div className="mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C849A] mb-3">Communication</p>
          <h1 className="text-4xl font-display font-bold text-[#16324F] tracking-tight">
            Messages
          </h1>
        </div>

        {conversations.length === 0 ? (
          <div className="py-24 text-center bg-[#F4F8FC] rounded-[3rem] border border-[#D7E4F0]/50">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
              💬
            </div>
            <h3 className="text-xl font-display font-bold text-[#16324F] mb-2">No conversations yet</h3>
            <p className="text-[#58708A] font-medium max-w-xs mx-auto">
              When you inquire about an item or receive an interest, your chats will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((convo) => {
              const otherId = convo.participantIDs.find((id) => id !== profile?.id) ?? "";
              const otherName = convo.participantNames[otherId] ?? "User";
              const otherImage = convo.participantImages[otherId];

              return (
                <Link
                  key={convo.id}
                  href={`/messages/${convo.id}`}
                  className="flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-[#D7E4F0]/40 hover:bg-[#F4F8FC] hover:border-[#4B9CD3]/30 transition-all group"
                >
                  <div className="relative">
                    {otherImage ? (
                      <Image
                        src={otherImage}
                        alt=""
                        width={60}
                        height={60}
                        className="rounded-2xl object-cover shrink-0 ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] bg-[#D7E4F0] rounded-2xl shrink-0 flex items-center justify-center text-xl text-[#1F4F7A]">
                        {otherName[0]}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-bold text-[#16324F] group-hover:text-[#4B9CD3] transition-colors">{otherName}</p>
                      <span className="text-[10px] font-bold text-[#6C849A] uppercase tracking-widest">
                        {timeAgo(convo.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#4B9CD3] uppercase tracking-wider mb-1 truncate">
                      {convo.listingTitle}
                    </p>
                    <p className="text-sm text-[#58708A] truncate font-medium">
                      {convo.lastMessage || "Start the conversation..."}
                    </p>
                  </div>
                  
                  <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-[#4B9CD3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
