import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, ChevronDown, ArrowLeft, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore, type PeerConversation } from "@/store/appStore";

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  return date.toLocaleDateString();
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface ConversationItemProps {
  conversation: PeerConversation;
  currentUserId: string;
  onClick: () => void;
}

function ConversationItem({ conversation, currentUserId, onClick }: ConversationItemProps) {
  const { users, getUnreadCountForConversation, getDirectMessagesForConversation } = useAppStore();

  const otherId = conversation.participantIds.find((id) => id !== currentUserId) ?? "";
  const otherUser = users.find((u) => u.userId === otherId);
  const unread = getUnreadCountForConversation(conversation.conversationId, currentUserId);
  const messages = getDirectMessagesForConversation(conversation.conversationId);
  const lastMsg = messages[messages.length - 1];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
        {otherUser?.name.charAt(0).toUpperCase() ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-100 truncate">
            {otherUser?.name ?? "Unknown User"}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-xs text-zinc-500 shrink-0">
              {formatTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-400 truncate">
            {lastMsg ? lastMsg.content : "Start a conversation"}
          </span>
          {unread > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center shrink-0">
              {unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
  otherUserId: string;
  onBack: () => void;
}

function MessageThread({ conversationId, currentUserId, otherUserId, onBack }: MessageThreadProps) {
  const { users, getDirectMessagesForConversation, sendDirectMessage, markConversationRead } = useAppStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUser = users.find((u) => u.userId === otherUserId);
  const messages = getDirectMessagesForConversation(conversationId);

  useEffect(() => {
    markConversationRead(conversationId, currentUserId);
  }, [conversationId, currentUserId, markConversationRead, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    sendDirectMessage(currentUserId, otherUserId, text);
    setInput("");
    inputRef.current?.focus();
  }, [input, currentUserId, otherUserId, sendDirectMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 shrink-0">
        <button
          onClick={onBack}
          className="text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
          {otherUser?.name.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-100">{otherUser?.name ?? "Unknown"}</p>
          <p className="text-xs text-zinc-500 capitalize">{otherUser?.role ?? ""}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 text-sm py-8">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />
            <p>No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderUserId === currentUserId;
          return (
            <div
              key={msg.messageId}
              className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  isMine
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-zinc-600">{formatMessageTime(msg.timestamp)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="text-blue-400 hover:text-blue-300 disabled:opacity-30 transition-colors"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface UserChatProps {
  /** If provided, opens a conversation with this user directly */
  openWithUserId?: string;
}

export function UserChat({ openWithUserId }: UserChatProps) {
  const {
    getCurrentUser,
    users,
    getPeerConversationsForUser,
    getOrCreatePeerConversation,
    getTotalUnreadCount,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeOtherUserId, setActiveOtherUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = getCurrentUser();

  // If openWithUserId is provided and changes, open that conversation
  useEffect(() => {
    if (openWithUserId && currentUser) {
      const convId = getOrCreatePeerConversation(currentUser.userId, openWithUserId);
      setActiveConversationId(convId);
      setActiveOtherUserId(openWithUserId);
      setIsOpen(true);
    }
  }, [openWithUserId, currentUser, getOrCreatePeerConversation]);

  if (!currentUser) return null;

  const conversations = getPeerConversationsForUser(currentUser.userId).sort((a, b) => {
    const aTime = a.lastMessageAt ?? a.createdAt;
    const bTime = b.lastMessageAt ?? b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const totalUnread = getTotalUnreadCount(currentUser.userId);

  // Users available to start a new chat (all registered users except self)
  const availableUsers = users.filter(
    (u) =>
      u.userId !== currentUser.userId &&
      (searchQuery === "" ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openConversation = (convId: string, otherId: string) => {
    setActiveConversationId(convId);
    setActiveOtherUserId(otherId);
  };

  const startNewChat = (otherId: string) => {
    const convId = getOrCreatePeerConversation(currentUser.userId, otherId);
    openConversation(convId, otherId);
    setSearchQuery("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveConversationId(null);
    setActiveOtherUserId(null);
    setSearchQuery("");
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Open chat"
      >
        {isOpen ? (
          <ChevronDown size={20} className="text-white" />
        ) : (
          <MessageCircle size={20} className="text-white" />
        )}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-40 w-80 h-[480px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {activeConversationId && activeOtherUserId ? (
            <MessageThread
              conversationId={activeConversationId}
              currentUserId={currentUser.userId}
              otherUserId={activeOtherUserId}
              onBack={() => {
                setActiveConversationId(null);
                setActiveOtherUserId(null);
              }}
            />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-sm font-semibold text-zinc-100">Messages</span>
                  {totalUnread > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                      {totalUnread}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search / new chat */}
              <div className="px-3 py-2 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5">
                  <Search size={13} className="text-zinc-500 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Search results — show users when searching */}
                {searchQuery.trim() !== "" ? (
                  <div>
                    <p className="px-4 py-2 text-xs text-zinc-500 uppercase tracking-wide">Start new chat</p>
                    {availableUsers.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-zinc-500">No users found</p>
                    ) : (
                      availableUsers.map((u) => (
                        <button
                          key={u.userId}
                          onClick={() => startNewChat(u.userId)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-zinc-100">{u.name}</p>
                            <p className="text-xs text-zinc-500 capitalize">{u.role}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                    <MessageCircle size={36} className="text-zinc-600" />
                    <p className="text-sm text-zinc-400 font-medium">No conversations yet</p>
                    <p className="text-xs text-zinc-600">
                      Search for a user above to start chatting
                    </p>
                  </div>
                ) : (
                  <div>
                    {conversations.map((conv) => {
                      const otherId =
                        conv.participantIds.find((id) => id !== currentUser.userId) ?? "";
                      return (
                        <ConversationItem
                          key={conv.conversationId}
                          conversation={conv}
                          currentUserId={currentUser.userId}
                          onClick={() => openConversation(conv.conversationId, otherId)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
