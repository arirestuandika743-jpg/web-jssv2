'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Image, MapPin, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/services/chatService';
import type { ChatMessage } from '@/types';

export default function CourierChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [roomId, setRoomId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const courierId = 'drv-1';
  const courierName = user?.name || 'Kurir JSS';

  useEffect(() => {
    const init = async () => {
      const room = await chatService.getOrCreateRoom(courierId, courierName);
      setRoomId(room.id);
      const msgs = await chatService.getMessages(room.id);
      setMessages(msgs);
      await chatService.markAsRead(room.id, courierId);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(async () => {
      const msgs = await chatService.getMessages(roomId);
      setMessages(msgs);
      await chatService.markAsRead(roomId, courierId);
    }, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleSend = async () => {
    if (!input.trim() || !roomId) return;
    await chatService.sendMessage(roomId, courierId, courierName, 'courier', input.trim());
    setInput('');
    const msgs = await chatService.getMessages(roomId);
    setMessages(msgs);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="bg-secondary-800 px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <span className="text-primary font-bold">A</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Admin JSS</h2>
            <p className="text-emerald-400 text-xs">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-white/30 text-sm">Belum ada pesan</p>
            <p className="text-white/20 text-xs mt-1">Kirim pesan ke admin</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderRole === 'courier';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[80%] rounded-2xl px-4 py-2.5 
                  ${isMine
                    ? 'bg-primary text-secondary-900 rounded-br-md'
                    : 'bg-white/10 text-white rounded-bl-md'
                  }
                `}>
                  {msg.type === 'image' && msg.imageUrl && (
                    <img src={msg.imageUrl} alt="" className="rounded-xl mb-2 max-w-full" />
                  )}
                  {msg.type === 'location' && msg.location && (
                    <a
                      href={`https://maps.google.com/?q=${msg.location.lat},${msg.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 py-1 underline"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Lihat Lokasi</span>
                    </a>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] ${isMine ? 'text-secondary-900/50' : 'text-white/30'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMine && (
                      msg.isRead
                        ? <CheckCheck className="w-3 h-3 text-secondary-900/50" />
                        : <Check className="w-3 h-3 text-secondary-900/30" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-secondary-800 border-t border-white/10">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 px-4 py-2.5">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              rows={1}
              className="w-full bg-transparent text-white text-sm outline-none resize-none placeholder-white/30"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center disabled:opacity-30 flex-shrink-0"
          >
            <Send className="w-4 h-4 text-secondary-900" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
