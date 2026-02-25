import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Trash2, Bot, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { requestOpenAIGPTChat } from "@/sdk/api-clients/688a0b64dc79a2533460892c/requestOpenAIGPTChat";

const SYSTEM_PROMPT = `You are a helpful 24/7 AI support assistant for DealMatch, a real estate matching platform that connects motivated property sellers with qualified investors.

Here is what you know about DealMatch:

**Platform Overview:**
- DealMatch uses an advanced matching algorithm that scores compatibility between sellers and investors
- Matching factors: financial alignment (30%), urgency (20%), location (20%), motivation (15%), closing probability (15%)
- Minimum match score of 40 required; scores of 70+ are considered high-probability matches

**User Roles:**
- Sellers: List their property for free, get unlimited investor matches. They see investor contact info at no cost.
- Investors: Get matched to properties. Free tier shows 1 match. Basic plan shows up to 5 matches. Premium plan shows unlimited matches.

**Subscription Plans:**
- Free/Trial: 1 visible match for investors, 14-day trial period
- Basic: Up to 5 matches for investors
- Premium: Unlimited matches for investors + priority placement

**Key Features:**
- Off-platform sellers: Investors can also be matched with sellers who aren't registered on the app yet — these show up with social media links (Twitter/X, Instagram, LinkedIn, Facebook) so investors can reach out directly
- Match scores break down financial, urgency, motivation, and closing probability sub-scores
- Alerts for new high-probability matches (score ≥ 85)
- Account management: profile editing, notification preferences, social media linking

**Onboarding:**
- Sellers provide: property type, asking price, location, condition, selling motivation, urgency level, price flexibility
- Investors provide: target location, budget range, preferred property types, financing method, renovation tolerance, investment strategy, purchase urgency

**Common Support Questions:**
- How to improve match scores: Improve price flexibility, update urgency level, expand target locations
- Upgrading subscription: Available in Account settings
- Editing profile: Go to Account > Edit Profile
- Off-platform sellers: Contact via the social links shown on their match card
- Match not showing: Minimum 40 score required; try adjusting search criteria

Be friendly, concise, and helpful. If you don't know something specific about DealMatch, say so honestly and suggest the user contact support directly.`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AISupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your 24/7 DealMatch support assistant. I can help sellers and investors with questions about matches, subscriptions, profile setup, and anything else about the platform. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { getCurrentUser, addChatMessage, getChatMessagesForUser, clearChatHistory } =
    useAppStore();
  const user = getCurrentUser();

  // Load persisted messages from store when opening (if user is logged in)
  useEffect(() => {
    if (isOpen && user) {
      const stored = getChatMessagesForUser(user.userId);
      if (stored.length > 0) {
        const restored: Message[] = stored.map((m) => ({
          id: m.messageId,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        }));
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              "Hi! I'm your 24/7 DealMatch support assistant. I can help sellers and investors with questions about matches, subscriptions, profile setup, and anything else about the platform. What can I help you with today?",
            timestamp: new Date(),
          },
          ...restored,
        ]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 50);
    }
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distanceFromBottom > 100);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Persist user message to store
    if (user) {
      addChatMessage({ userId: user.userId, content: trimmed, role: "user" });
    }

    // Build conversation history for the API (last 10 messages for context window)
    const history = messages
      .filter((m) => m.id !== "welcome")
      .slice(-10)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    try {
      const result = await requestOpenAIGPTChat({
        body: {
          model: "MaaS_4.1",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: trimmed },
          ],
        },
      });

      let assistantContent =
        "I'm sorry, I had trouble generating a response. Please try again.";

      if (result.data) {
        const responseData = result.data as {
          choices?: { message?: { content?: string } }[];
        };
        const content = responseData.choices?.[0]?.message?.content;
        if (content) {
          assistantContent = content;
        }
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Persist assistant message to store
      if (user) {
        addChatMessage({
          userId: user.userId,
          content: assistantContent,
          role: "assistant",
        });
      }
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again in a moment, or reach out via email if this continues.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm your 24/7 DealMatch support assistant. I can help sellers and investors with questions about matches, subscriptions, profile setup, and anything else about the platform. What can I help you with today?",
        timestamp: new Date(),
      },
    ]);
    if (user) {
      clearChatHistory(user.userId);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-lg transition-all duration-200",
          "bg-blue-600 hover:bg-blue-700 text-white px-4 py-3",
          isOpen && "opacity-0 pointer-events-none scale-90"
        )}
        aria-label="Open support chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Support</span>
        <span className="flex h-2 w-2 rounded-full bg-green-400 ring-2 ring-white" />
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white",
          "w-[370px] transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        )}
        style={{ height: "560px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 rounded-t-2xl text-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">DealMatch Support</p>
              <p className="text-xs text-blue-100 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1 align-middle" />
                Always online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-1 max-w-[85%]",
                msg.role === "user" ? "self-end items-end ml-auto" : "self-start items-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 px-1">
                  <Bot className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-gray-400 font-medium">AI Support</span>
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-gray-400 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex flex-col gap-1 max-w-[85%] self-start items-start">
              <div className="flex items-center gap-1.5 px-1">
                <Bot className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-gray-400 font-medium">AI Support</span>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-[72px] right-4 p-1.5 rounded-full bg-white shadow-md border border-gray-200 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}

        {/* Input area */}
        <div className="border-t border-gray-100 px-3 py-3 bg-white rounded-b-2xl">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about DealMatch..."
              rows={1}
              className={cn(
                "flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5",
                "text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "max-h-[100px] min-h-[40px] overflow-y-auto"
              )}
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
              }}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-10 w-10 p-0 rounded-xl bg-blue-600 hover:bg-blue-700 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
