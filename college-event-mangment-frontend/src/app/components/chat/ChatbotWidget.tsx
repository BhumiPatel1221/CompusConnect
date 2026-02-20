import React, { useEffect, useMemo, useRef, useState } from "react";
import { getChatbotSocket } from "../../../services/chatbotSocket";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text: string;
  ts: string;
};

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function ChatbotWidget({ title = "CampusConnect Assistant" }: { title?: string }) {
  const socket = useMemo(() => getChatbotSocket(), []);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      from: "bot",
      text: "Ask me: 'Show upcoming events', 'Show my registered events', 'Which company is visiting next?', or 'What is the time of AI Workshop?'",
      ts: new Date().toISOString(),
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onBotReply = (payload: { text: string; ts: string }) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `${payload.ts}-bot`,
          from: "bot",
          text: payload.text,
          ts: payload.ts,
        },
      ]);
    };

    socket.on("botReply", onBotReply);

    return () => {
      socket.off("botReply", onBotReply);
    };
  }, [socket]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const ts = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        id: `${ts}-user`,
        from: "user",
        text,
        ts,
      },
    ]);

    setInput("");
    setIsTyping(true);

    socket.emit("message", { text, ts });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mb-4 w-[90vw] max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-background/80 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="truncate text-sm font-semibold">{title}</div>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">Online</div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col">
              <div ref={listRef} className="h-80 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={m.from === "user" ? "text-right" : "text-left"}>
                    <div
                      className={
                        m.from === "user"
                          ? "inline-block max-w-[90%] rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 px-3 py-2 text-sm text-white shadow-lg"
                          : "inline-block max-w-[90%] rounded-2xl bg-white/5 px-3 py-2 text-sm text-foreground shadow"
                      }
                    >
                      <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                      <div className={m.from === "user" ? "mt-1 text-[10px] text-white/80" : "mt-1 text-[10px] text-muted-foreground"}>
                        {formatTime(m.ts)}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="text-left">
                    <div className="inline-block rounded-2xl bg-white/5 px-3 py-2 text-sm text-muted-foreground">
                      Bot is typing...
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    className="bg-background/60"
                  />
                  <Button
                    type="button"
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="shrink-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow hover:shadow-lg"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        className={
          "group relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        }
      >
        <span className="absolute inset-0 rounded-full blur-xl opacity-0 transition-opacity duration-200 group-hover:opacity-40 bg-gradient-to-br from-blue-600 to-purple-600" />
        <MessageCircle className="relative h-6 w-6 text-white" />
      </button>
    </div>
  );
 }
