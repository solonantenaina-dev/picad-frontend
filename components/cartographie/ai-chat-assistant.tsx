"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* =======================
   Types
======================= */

interface Message {
  id: string;
  content: string;
  sender: "bot" | "user";
  timestamp: Date;
}

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  response?: string;
  output?: string;
  error?: string;
}

/* =======================
   Icons
======================= */

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

/* =======================
   Config
======================= */

const N8N_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ||
  "https://n8n.itdcmada.com/webhook-test/chat";

/* =======================
   Component
======================= */

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =======================
     Send message
  ======================= */

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: message.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: "typing",
        content: "Je réfléchis...",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

    const currentMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage } as ChatRequest),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = (await response.json()) as ChatResponse;

      const botText =
        data.response ??
        data.output ??
        data.resultText ??
        "Désolé, je n'ai pas pu traiter votre demande.";
      
        console.log("Webhook response:", data);



      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== "typing"),
        { id: crypto.randomUUID(), content: botText, sender: "bot", timestamp: new Date() },
      ]);
    } catch (error) {
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== "typing")
          .concat({
            id: crypto.randomUUID(),
            content:
              error instanceof Error
                ? `Désolé, une erreur s'est produite : ${error.message}`
                : "Désolé, une erreur s'est produite.",
            sender: "bot",
            timestamp: new Date(),
          })
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     Render
  ======================= */

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-background border rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BotIcon className="h-6 w-6" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-white"
              onClick={() => setIsOpen(false)}
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-green-50 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-background flex gap-2">
            <Input
              placeholder="Écrire un message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="bg-green-600 text-white"
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition"
      >
        <BotIcon className="h-7 w-7" />
      </button>
    </>
  );
}
