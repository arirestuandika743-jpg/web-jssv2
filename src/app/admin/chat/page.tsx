'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, CheckCheck, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/services/chatService';
import type { ChatRoom, ChatMessage } from '@/types';

export default function AdminChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatService.getAllRooms().then(r => { setRooms(r); setLoading(false); });
    const interval = setInterval(async () => {
      const r = await chatService.getAllRooms();
      setRooms(r);
      if (selectedRoom) {
        const msgs = await chatService.getMessages(selectedRoom.id);
        setMessages(msgs);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    const msgs = await chatService.getMessages(room.id);
    setMessages(msgs);
    await chatService.markAsRead(room.id, user?.id || 'admin-id-123');
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedRoom) return;
    await chatService.sendMessage(
      selectedRoom.id,
      user?.id || 'admin-id-123',
      user?.name || 'Admin JSS',
      'admin',
      input.trim()
    );
    setInput('');
    const msgs = await chatService.getMessages(selectedRoom.id);
    setMessages(msgs);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-card overflow-hidden bg-white shadow-soft">
      {/* Room List */}
      <div className={`w-80 border-r border-secondary-100 flex flex-col ${selectedRoom ? 'hidden md:flex' : 'flex w-full md:w-80'}`}>
        <div className="p-4 border-b border-secondary-100">
          <h2 className="text-lg font-bold text-secondary-900 mb-3">💬 Chat Kurir</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-300" />
            <input
              type="text"
              placeholder="Cari kurir..."
              className="w-full pl-9 pr-3 py-2 bg-secondary-50 rounded-xl text-sm outline-none border border-secondary-100 focus:border-primary"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-6 text-center text-secondary-400 text-sm">Belum ada percakapan</div>
          ) : (
            rooms.map(room => (
              <button
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-secondary-50 transition-colors border-b border-secondary-50 ${
                  selectedRoom?.id === room.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary-900 font-bold text-sm">{room.courierName[0]}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-secondary-900 font-semibold text-sm truncate">{room.courierName}</p>
                  <p className="text-secondary-400 text-xs truncate">{room.lastMessage || 'Belum ada pesan'}</p>
                </div>
                {room.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-secondary-900">{room.unreadCount}</span>
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-secondary-100 flex items-center gap-3">
              <button onClick={() => setSelectedRoom(null)} className="md:hidden text-secondary-400 mr-1">←</button>
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-secondary-900 font-bold text-xs">{selectedRoom.courierName[0]}</span>
              </div>
              <div>
                <p className="text-secondary-900 font-semibold text-sm">{selectedRoom.courierName}</p>
                <p className="text-emerald-500 text-xs">Kurir</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-secondary-50/30">
              {messages.map(msg => {
                const isMine = msg.senderRole === 'admin';
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isMine 
                        ? 'bg-primary text-secondary-900 rounded-br-md' 
                        : 'bg-white text-secondary-900 shadow-soft rounded-bl-md'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                        <span className={`text-[10px] ${isMine ? 'text-secondary-900/40' : 'text-secondary-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (msg.isRead ? <CheckCheck className="w-3 h-3 text-secondary-900/40" /> : <Check className="w-3 h-3 text-secondary-900/30" />)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-secondary-100 flex items-end gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-2.5 bg-secondary-50 rounded-xl text-sm outline-none border border-secondary-100 focus:border-primary"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center disabled:opacity-30"
              >
                <Send className="w-4 h-4 text-secondary-900" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-secondary-400 text-sm">Pilih percakapan untuk memulai chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
