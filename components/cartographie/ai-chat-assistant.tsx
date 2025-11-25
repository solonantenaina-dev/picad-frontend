"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  content: string;
  sender: "bot" | "user";
  timestamp: Date;
}

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

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Bonjour, bienvenu(e) Mr Faneva, en quoi puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date(),
    },
    {
      id: "2",
      content:
        "Je veux obtenir un rapport sur les doléances récentes de Fianarantsoa.",
      sender: "user",
      timestamp: new Date(),
    },
    {
      id: "3",
      content:
        "Bien sûr ! Je peux vous générer un résumé thématique ou un rapport détaillé avec cartes et statistiques. Que souhaitez-vous recevoir ?",
      sender: "bot",
      timestamp: new Date(),
    },
    {
      id: "4",
      content: "Résumé thématique.",
      sender: "user",
      timestamp: new Date(),
    },
    {
      id: "5",
      content: "Reflexion... Lorem ipsum dolor sit",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Je traite votre demande...",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <BotIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">AI Chat Assistant</h3>
                <p className="text-xs text-green-100 flex items-center gap-1">
                  En ligne
                  <span className="inline-block w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-green-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                    <BotIcon className="h-4 w-4 text-white" />
                  </div>
                )}
                {msg.sender === "user" && (
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-medium">F</span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === "bot"
                      ? "bg-white text-foreground rounded-bl-none"
                      : "bg-green-600 text-white rounded-br-none"
                  }`}
                >
                  {msg.content}
                  {msg.sender === "bot" &&
                    msg.content.includes("Reflexion") && (
                      <div className="flex gap-1 mt-1">
                        <span
                          className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-background border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Ecrire un message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSend}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <SendIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors z-50 ring-4 ring-green-200"
      >
        <BotIcon className="h-7 w-7" />
      </button>
    </>
  );
}
