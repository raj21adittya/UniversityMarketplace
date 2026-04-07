"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/constants";
import { Conversation, Message } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConvo() {
      const snap = await getDoc(doc(db, COLLECTIONS.conversations, id));
      if (snap.exists()) {
        const d = snap.data();
        setConversation({
          ...d,
          id: snap.id,
          lastMessageAt: d.lastMessageAt?.toDate?.() ?? new Date(),
          createdAt: d.createdAt?.toDate?.() ?? new Date(),
        } as Conversation);
      }
    }
    loadConvo();
  }, [id]);

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.conversations, id, COLLECTIONS.messages),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          ...d,
          id: doc.id,
          createdAt: d.createdAt?.toDate?.() ?? new Date(),
        } as Message;
      });
      setMessages(msgs);
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !profile) return;

    setSending(true);
    setText("");

    const msgId = crypto.randomUUID();
    const msg: Message = {
      id: msgId,
      conversationID: id,
      senderID: profile.id,
      text: trimmed,
      createdAt: new Date(),
    };

    try {
      await setDoc(
        doc(db, COLLECTIONS.conversations, id, COLLECTIONS.messages, msgId),
        msg
      );
      await updateDoc(doc(db, COLLECTIONS.conversations, id), {
        lastMessage: trimmed,
        lastMessageAt: Timestamp.fromDate(new Date()),
        lastSenderID: profile.id,
      });
    } catch (e) {
      console.error("Send failed:", e);
    }
    setSending(false);
  }

  if (!conversation || !profile) {
    return <div className="text-center py-16 text-gray-400">Loading...</div>;
  }

  const otherId = conversation.participantIDs.find((pid) => pid !== profile.id) ?? "";
  const otherName = conversation.participantNames[otherId] ?? "User";

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white md:max-w-3xl md:mx-auto md:border-x md:border-[#F4F8FC]">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#F4F8FC]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#F4F8FC] rounded-xl flex items-center justify-center text-lg shadow-sm border border-[#D7E4F0]/30">
            👤
          </div>
          <div>
            <p className="font-bold text-[#16324F] leading-none mb-1">{otherName}</p>
            <p className="text-[10px] font-bold text-[#4B9CD3] uppercase tracking-widest">
              {conversation.listingTitle} · ${conversation.listingPrice.toFixed(0)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-lg hover:bg-[#F4F8FC] flex items-center justify-center text-[#6C849A] transition-colors">
            ℹ️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-white scrollbar-hide">
        <div className="text-center mb-10">
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#6C849A] bg-[#F4F8FC] px-4 py-1.5 rounded-full border border-[#D7E4F0]/30">
            Secure marketplace connection
          </span>
        </div>

        {messages.map((msg) => {
          const isMine = msg.senderID === profile.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm ${
                  isMine
                    ? "bg-[#16324F] text-white rounded-br-none"
                    : "bg-[#F4F8FC] text-[#16324F] rounded-bl-none border border-[#D7E4F0]/30"
                }`}
              >
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
                <p
                  className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${
                    isMine ? "text-white/40" : "text-[#6C849A]"
                  }`}
                >
                  {msg.createdAt.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-6 bg-white border-t border-[#F4F8FC]">
        <form
          onSubmit={handleSend}
          className="relative flex items-center group"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-[#F4F8FC] border-2 border-transparent focus:border-[#4B9CD3]/20 rounded-2xl px-6 py-4 text-base text-[#16324F] outline-none transition-all pr-16 font-medium"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="absolute right-2 w-12 h-12 bg-[#16324F] text-white rounded-xl flex items-center justify-center transition-all hover:bg-[#1F4F7A] disabled:opacity-30 shadow-lg shadow-[#16324F]/10 active:scale-95"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "↑"
            )}
          </button>
        </form>
        <p className="text-[9px] text-center text-[#6C849A] font-bold uppercase tracking-[0.15em] mt-4">
          Always meet in public campus areas for safety
        </p>
      </div>
    </div>
  );
}
