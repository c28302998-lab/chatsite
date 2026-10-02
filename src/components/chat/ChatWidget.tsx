"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, X, Send, ChevronLeft, User as UserIcon } from "lucide-react";

type Message = {
  id: string;
  text: string;
  senderId: string;
  receiverId: string | null;
  isRead: boolean;
  createdAt: string;
};

type ChatUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
};

export default function ChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = session?.user?.role === "ADMIN";

  // Fetch logic
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        if (isAdmin && !activeUserId) {
          // Fetch users list
          const res = await fetch("/api/chat");
          if (res.ok) {
            const data = await res.json();
            setChatUsers(data);
          }
        } else {
          // Fetch messages
          const url = activeUserId ? `/api/chat?userId=${activeUserId}` : "/api/chat";
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setMessages(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [isOpen, isAdmin, activeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    const tempMessage = {
      id: "temp-" + Date.now(),
      text: inputText,
      senderId: session?.user?.id || "",
      receiverId: isAdmin ? activeUserId : null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempMessage]);
    setInputText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: tempMessage.text,
          receiverId: tempMessage.receiverId,
        }),
      });
      
      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? newMessage : m)));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAdmin && activeUserId && (
                <button 
                  onClick={() => setActiveUserId(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 className="font-semibold text-white">
                  {isAdmin && !activeUserId ? "Сообщения" : isAdmin ? "Диалог с пользователем" : "Связь с Руководством"}
                </h3>
                <p className="text-xs text-emerald-400">В сети</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {isAdmin && !activeUserId ? (
              // Users List (Admin)
              chatUsers.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center">
                  Нет активных диалогов.<br/>Пользователи могут написать вам через этот чат.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {chatUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setActiveUserId(u.id)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left border border-transparent hover:border-white/5"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <UserIcon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white text-sm truncate">{u.name || u.email}</span>
                          {u.unread > 0 && (
                            <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {u.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{u.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              // Messages (User or Admin+User)
              <>
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center px-4">
                    Напишите сообщение. Мы ответим как можно быстрее!
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.senderId === session.user.id;
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                    >
                      <div 
                        className={`px-4 py-2 rounded-2xl ${
                          isMe 
                            ? "bg-indigo-600 text-white rounded-br-sm" 
                            : "bg-white/10 text-white rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          {(!isAdmin || activeUserId) && (
            <form onSubmit={handleSendMessage} className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Введите сообщение..."
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
