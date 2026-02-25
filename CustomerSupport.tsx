import { useState, useRef, useEffect } from "react";
import { useAppStore, type ChatMessage } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { requestOpenAIGPTChat } from "@/sdk/api-clients/688a0b64dc79a2533460892c/requestOpenAIGPTChat";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SYSTEM_PROMPT = `You are a friendly and knowledgeable 24/7 customer support agent for DealMatch, an AI-powered real estate property matching platform.

You help users with:
- How the platform works (AI-powered matching between motivated sellers and serious buyers/investors)
- Account management (registration, login, profiles, subscription plans)
- Understanding match scores (financial compatibility, urgency alignment, seller motivation, closing probability)
- Subscription plans: Basic ($99/mo - up to 5 matches), Premium ($149/mo - unlimited matches)
- Seller accounts are always free with unlimited buyer matches
- Trial period is 10 days for new accounts
- Social media linking in account settings
- Troubleshooting common issues

Be concise, helpful, and professional. If you don't know the answer to a specific question, let users know they can email support@dealmatch.io.`;

interface Props {
  open: boolean;
  onClose: () => void;
}

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  messageId: string;
}

export function CustomerSupport({ open, onClose }: Props) {
  const { getCurrentUser, getChatMessagesForUser, addChatMessage, clearChatHistory } = useAppStore();
  const user = getCurrentUser();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<DisplayMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load persisted messages on mount / user change
  useEffect(() => {
    if (!user) {
      setLocalMessages([
        {
          role: "assistant",
          content: "Hi! I'm the DealMatch support assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
          messageId: "welcome",
        },
      ]);
      return;
    }
    const stored = getChatMessagesForUser(user.userId) as ChatMessage[];
    if (stored.length > 0) {
      setLocalMessages(stored as DisplayMessage[]);
    } else {
      setLocalMessages([
        {
          role: "assistant",
          content: `Hi ${user.name}! I'm your 24/7 DealMatch support assistant. How can I help you today?`,
          timestamp: new Date().toISOString(),
          messageId: "welcome",
        },
      ]);
    }
  }, [user?.userId]);

  // Scroll to bottom on new messages or open
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [localMessages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: DisplayMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      messageId: `u-${Date.now()}`,
    };

    setLocalMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Persist user message
    if (user) {
      addChatMessage({ userId: user.userId, content: text, role: "user" });
    }

    // Build conversation history for the API (skip the welcome message)
    const history = localMessages
      .filter((m) => m.messageId !== "welcome")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    history.push({ role: "user", content: text });

    try {
      const result = await requestOpenAIGPTChat({
        body: {
          model: "MaaS_4.1",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        },
      });

      const aiContent =
        result.data?.choices?.[0]?.message?.content ??
        "I'm having trouble responding right now. Please try again or email support@dealmatch.io.";

      const assistantMsg: DisplayMessage = {
        role: "assistant",
        content: aiContent,
        timestamp: new Date().toISOString(),
        messageId: `a-${Date.now()}`,
      };

      setLocalMessages((prev) => [...prev, assistantMsg]);

      if (user) {
        addChatMessage({ userId: user.userId, content: aiContent, role: "assistant" });
      }
    } catch {
      const errMsg: DisplayMessage = {
        role: "assistant",
        content: "Sorry, I'm temporarily unavailable. Please try again shortly or email support@dealmatch.io.",
        timestamp: new Date().toISOString(),
        messageId: `err-${Date.now()}`,
      };
      setLocalMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (user) clearChatHistory(user.userId);
    setLocalMessages([
      {
        role: "assistant",
        content: user
          ? `Hi ${user.name}! How can I help you today?`
          : "Hi! How can I help you today?",
        timestamp: new Date().toISOString(),
        messageId: "welcome",
      },
    ]);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">DealMatch Support</p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <p className="text-white/80 text-xs">Online 24/7</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 h-7 w-7"
            onClick={handleClear}
            title="Clear chat"
          >
            <Trash2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 h-7 w-7"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 h-72 bg-slate-50">
        <div className="p-3 space-y-3">
          {localMessages.map((msg) => (
            <div
              key={msg.messageId}
              className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  msg.role === "assistant" ? "bg-blue-100" : "bg-slate-200"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot size={14} className="text-blue-600" />
                ) : (
                  <User size={14} className="text-slate-600" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3 py-2 text-sm",
                  msg.role === "assistant"
                    ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                    : "bg-blue-600 text-white rounded-tr-sm"
                )}
              >
                {msg.content}
                <p
                  className={cn(
                    "text-xs mt-1",
                    msg.role === "assistant" ? "text-slate-400" : "text-blue-200"
                  )}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Bot size={14} className="text-blue-600" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2">
                <Loader2 size={16} className="text-blue-500 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Quick suggestions */}
      {localMessages.length <= 1 && (
        <div className="px-3 pb-2 bg-slate-50 flex flex-wrap gap-1.5">
          {["How do matches work?", "Subscription plans", "How to get started"].map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="cursor-pointer text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              onClick={() => {
                setInput(s);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              {s}
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 p-3 border-t bg-white">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          disabled={loading}
          className="text-sm"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 shrink-0"
        >
          <Send size={15} />
        </Button>
      </div>
    </div>
  );
}

interface TriggerProps {
  onClick: () => void;
  open: boolean;
}

export function CustomerSupportTrigger({ onClick, open }: TriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all",
        open
          ? "bg-slate-700 hover:bg-slate-800"
          : "bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      )}
      aria-label="Customer support chat"
    >
      {open ? (
        <X size={22} className="text-white" />
      ) : (
        <MessageCircle size={22} className="text-white" />
      )}
    </button>
  );
}
