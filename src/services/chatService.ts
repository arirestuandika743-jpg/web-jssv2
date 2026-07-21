'use client';

import type { ChatRoom, ChatMessage, LatLng } from '@/types';

const MOCK_ROOMS_KEY = 'jss_chat_rooms';
const MOCK_MESSAGES_KEY = 'jss_chat_messages';

function getMock<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try { return JSON.parse(stored); } catch { return fallback; }
}

function setMock<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const chatService = {
  /** Get or create a chat room for courier */
  async getOrCreateRoom(courierId: string, courierName: string): Promise<ChatRoom> {
    const rooms = getMock<ChatRoom>(MOCK_ROOMS_KEY);
    let room = rooms.find(r => r.courierId === courierId);
    
    if (!room) {
      room = {
        id: genId(),
        courierId,
        courierName,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };
      rooms.push(room);
      setMock(MOCK_ROOMS_KEY, rooms);
    }

    return room;
  },

  /** Get all chat rooms (admin view) */
  async getAllRooms(): Promise<ChatRoom[]> {
    return getMock<ChatRoom>(MOCK_ROOMS_KEY);
  },

  /** Send a message */
  async sendMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    senderRole: 'courier' | 'admin',
    content: string,
    type: 'text' | 'image' | 'location' = 'text',
    imageUrl?: string,
    location?: LatLng
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: genId(),
      roomId,
      senderId,
      senderName,
      senderRole,
      type,
      content,
      imageUrl,
      location,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const messages = getMock<ChatMessage>(MOCK_MESSAGES_KEY);
    messages.push(message);
    setMock(MOCK_MESSAGES_KEY, messages);

    // Update room's last message
    const rooms = getMock<ChatRoom>(MOCK_ROOMS_KEY);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.lastMessage = type === 'text' ? content : type === 'image' ? '📷 Foto' : '📍 Lokasi';
      room.lastMessageAt = message.createdAt;
      room.unreadCount += 1;
      setMock(MOCK_ROOMS_KEY, rooms);
    }

    return message;
  },

  /** Get messages for a room */
  async getMessages(roomId: string, limit: number = 100): Promise<ChatMessage[]> {
    const messages = getMock<ChatMessage>(MOCK_MESSAGES_KEY);
    return messages
      .filter(m => m.roomId === roomId)
      .slice(-limit);
  },

  /** Mark messages as read */
  async markAsRead(roomId: string, readerId: string): Promise<void> {
    const messages = getMock<ChatMessage>(MOCK_MESSAGES_KEY);
    let changed = false;
    messages.forEach(m => {
      if (m.roomId === roomId && m.senderId !== readerId && !m.isRead) {
        m.isRead = true;
        changed = true;
      }
    });
    if (changed) setMock(MOCK_MESSAGES_KEY, messages);

    // Reset unread count for room
    const rooms = getMock<ChatRoom>(MOCK_ROOMS_KEY);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.unreadCount = 0;
      setMock(MOCK_ROOMS_KEY, rooms);
    }
  },

  /** Get unread count for a user */
  async getUnreadCount(userId: string): Promise<number> {
    const messages = getMock<ChatMessage>(MOCK_MESSAGES_KEY);
    return messages.filter(m => m.senderId !== userId && !m.isRead).length;
  },
};
