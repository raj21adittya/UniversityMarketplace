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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center gap-3 bg-white shrink-0">
        <div>
          <p className="font-semibold text-sm">{otherName}</p>
          <p className="text-xs text-[#4B9CD3]">
            {conversation.listingTitle} · ${conversation.listingPrice.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
        {messages.map((msg) => {
          const isMine = msg.senderID === profile.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isMine
                    ? "bg-[#4B9CD3] text-white rounded-br-md"
                    : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMine ? "text-white/60" : "text-gray-400"
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
      <form
        onSubmit={handleSend}
        className="border-t bg-white px-4 py-3 flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-[#4B9CD3] text-white rounded-full w-10 h-10 flex items-center justify-center text-lg disabled:opacity-40"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
