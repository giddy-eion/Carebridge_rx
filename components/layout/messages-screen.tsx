"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Send, Bell, Search } from "lucide-react";
import { usePatientsStore } from "@/stores/patients-store";
import { Avatar } from "@/components/ui/avatar";
import { lookupParticipant, otherParticipantId } from "@/lib/utils/participant-lookup";
import { getMockReply } from "@/lib/utils/mock-replies";
import { format, isToday, isYesterday } from "date-fns";

function formatTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export function MessagesScreen({ currentUserId }: { currentUserId: string }) {
  const conversations = usePatientsStore((s) => s.conversations);
  const sendMessage = usePatientsStore((s) => s.sendMessage);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const myConversations = conversations.filter((c) => c.participantIds.includes(currentUserId));
  const active = myConversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length]);

  function handleSend() {
    if (!active || !draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    sendMessage(active.id, currentUserId, text);
    const replyFromId = otherParticipantId(active.participantIds, currentUserId);
    setTimeout(() => {
      usePatientsStore.getState().sendMessage(active.id, replyFromId, getMockReply(replyFromId));
    }, 1400);
  }

  /* ── Thread view ── */
  if (active) {
    const otherId = otherParticipantId(active.participantIds, currentUserId);
    const other = lookupParticipant(otherId);
    return (
      <div className="flex flex-col h-full">
        {/* Thread header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-raised">
          <button
            onClick={() => setActiveConversationId(null)}
            className="w-8 h-8 rounded-full bg-surface shadow-[0_2px_6px_rgba(16,22,43,0.08)] flex items-center justify-center flex-shrink-0"
            aria-label="Back"
          >
            <ChevronLeft size={16} />
          </button>
          <Avatar name={other.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground">{other.name}</p>
            <p className="text-[10px] text-success-500">● Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {active.messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"} items-end gap-2`}>
                {!mine && <Avatar name={other.name} size="sm" />}
                <div
                  className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 ${
                    mine
                      ? "bg-brand-500 text-white rounded-br-sm"
                      : "bg-surface-raised text-foreground rounded-bl-sm shadow-[0_1px_4px_rgba(16,22,43,0.08)]"
                  }`}
                >
                  <p className="text-[13px] leading-snug">{m.body}</p>
                  <p className={`text-[9px] mt-1 ${mine ? "text-white/60" : "text-foreground-muted"}`}>
                    {format(new Date(m.sentAt), "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-surface-raised">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-[13px] outline-none focus-visible:border-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="w-10 h-10 rounded-full bg-brand-500 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-opacity"
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Conversation list ── */
  const filtered = myConversations.filter((c) => {
    const otherId = otherParticipantId(c.participantIds, currentUserId);
    const other = lookupParticipant(otherId);
    return other.name.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = myConversations.reduce((sum, c) => {
    const unread = c.messages.filter((m) => m.senderId !== currentUserId).length;
    return sum + (unread > 0 ? unread : 0);
  }, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 pt-1 pb-3">
        <div className="flex items-center gap-2 bg-surface-raised rounded-2xl px-3 py-2.5 shadow-[0_2px_8px_rgba(16,22,43,0.05)]">
          <Search size={14} className="text-foreground-muted flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-foreground-muted"
          />
        </div>
      </div>

      {/* Thread count */}
      <div className="flex items-center justify-between px-4 mb-2">
        <p className="text-[13px] font-semibold text-foreground">Conversations</p>
        <p className="text-[11px] text-foreground-muted">{filtered.length} threads</p>
      </div>

      {/* Notification thread (static) */}
      <div className="px-4 mb-2">
        <div className="bg-surface-raised rounded-2xl px-3 py-3 shadow-[0_2px_8px_rgba(16,22,43,0.05)] flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-chip-sky-bg flex items-center justify-center">
              <Bell size={18} className="text-chip-sky-icon" />
            </div>
            <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-danger-500 rounded-full border-2 border-surface-raised" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground">Notifications</p>
            <p className="text-[11px] text-foreground-muted truncate">
              Appointment reminder: You have an appointment tomorrow at 10:00 AM.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] text-foreground-muted">2 hrs ago</span>
            <span className="w-5 h-5 rounded-full bg-danger-500 text-white text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </div>
        </div>
      </div>

      {/* Real conversation threads */}
      <div className="flex flex-col gap-2 px-4 overflow-y-auto flex-1">
        {filtered.map((c) => {
          const otherId = otherParticipantId(c.participantIds, currentUserId);
          const other = lookupParticipant(otherId);
          const lastMessage = c.messages[c.messages.length - 1];
          const unread = c.messages.filter((m) => m.senderId !== currentUserId).length;
          return (
            <button key={c.id} onClick={() => setActiveConversationId(c.id)} className="text-left">
              <div className="bg-surface-raised rounded-2xl px-3 py-3 shadow-[0_2px_8px_rgba(16,22,43,0.05)] flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <Avatar name={other.name} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-500 rounded-full border-2 border-surface-raised" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{other.name}</p>
                  <p className="text-[11px] text-foreground-muted truncate">
                    {lastMessage?.body ?? "No messages yet"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {lastMessage && (
                    <span className="text-[10px] text-foreground-muted">{formatTime(lastMessage.sentAt)}</span>
                  )}
                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* All caught up empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
              <Bell size={24} className="text-brand-300" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">All caught up!</p>
            <p className="text-[11px] text-foreground-muted">You have no new messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
