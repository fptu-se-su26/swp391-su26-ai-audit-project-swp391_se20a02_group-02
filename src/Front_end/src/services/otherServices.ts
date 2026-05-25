import apiClient from './api';
import type { Review, Notification, Message, Conversation } from '@/types';
import { faker } from '@faker-js/faker';

// ====== REVIEW SERVICE ======
export const reviewService = {
  async getByVehicle(vehicleId: string): Promise<Review[]> {
    try {
      const response = await apiClient.get<any>(`/reviews/vehicle/${vehicleId}?page=0&size=50`);
      return response.data?.content || [];
    } catch (error) {
      return [];
    }
  },

  async getByUser(userId: string): Promise<Review[]> {
    try {
      const response = await apiClient.get<any>(`/reviews/user/${userId}?page=0&size=50`);
      return response.data?.content || [];
    } catch (error) {
      return [];
    }
  },

  async create(data: Partial<Review>): Promise<Review> {
    const payload = {
      vehicleId: data.vehicleId,
      bookingId: data.bookingId,
      rating: data.rating,
      cleanliness: data.cleanliness,
      accuracy: data.accuracy,
      communication: data.communication,
      value: data.value,
      comment: data.comment,
      photos: data.photos,
    };
    const response = await apiClient.post<any>('/reviews', payload);
    return response.data;
  },

  async getAll(): Promise<Review[]> {
    return [];
  },

  async getFeaturedReviews(): Promise<Review[]> {
    try {
      const response = await apiClient.get<any>('/reviews/featured?limit=3');
      return response.data?.data?.content || [];
    } catch (error) {
      console.error('Failed to fetch featured reviews', error);
      return [];
    }
  },
};

// ====== NOTIFICATION SERVICE ======
export const notificationService = {
  async getByUser(userId: string): Promise<Notification[]> {
    try {
      const response = await apiClient.get<any>('/notifications?page=0&size=50');
      return response.data?.content || [];
    } catch (error) {
      return [];
    }
  },

  async markRead(notificationId: string): Promise<void> {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`, {});
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  },

  async markAllRead(userId: string): Promise<void> {
    try {
      await apiClient.put('/notifications/read-all', {});
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  },

  async create(data: Partial<Notification>): Promise<Notification> {
    return { ...data, id: `notif-${faker.string.uuid()}`, read: false, createdAt: new Date().toISOString() } as Notification;
  },

  getUnreadCount(userId: string): number {
    return 0; // Front-end will calculate from getByUser response
  },
};

// ====== MESSAGE SERVICE (Local Fallback) ======
const MESSAGES_KEY = 'luxeway_messages';
const CONV_KEY = 'luxeway_conversations';

export const messageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const convs: Conversation[] = JSON.parse(localStorage.getItem(CONV_KEY) || '[]');
    const msgs: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');

    const userConvs = convs.filter(c => c.participants.includes(userId));
    return userConvs.map(conv => {
      const convMessages = msgs.filter(m => m.conversationId === conv.id);
      const lastMessage = convMessages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      return { ...conv, lastMessage };
    }).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const msgs: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    return msgs
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<Message> {
    const msgs: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    const convs: Conversation[] = JSON.parse(localStorage.getItem(CONV_KEY) || '[]');

    const newMessage: Message = {
      id: `msg-${faker.string.uuid()}`,
      conversationId,
      senderId,
      receiverId,
      type: 'text',
      content,
      createdAt: new Date().toISOString(),
      edited: false,
    };

    msgs.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));

    const convIndex = convs.findIndex(c => c.id === conversationId);
    if (convIndex >= 0) {
      convs[convIndex].lastActivity = new Date().toISOString();
      localStorage.setItem(CONV_KEY, JSON.stringify(convs));
    }

    return newMessage;
  },

  async createConversation(userId: string, ownerId: string, vehicleId?: string): Promise<Conversation> {
    const convs: Conversation[] = JSON.parse(localStorage.getItem(CONV_KEY) || '[]');
    const existing = convs.find(c =>
      c.participants.includes(userId) && c.participants.includes(ownerId) &&
      (vehicleId ? c.vehicleId === vehicleId : true)
    );
    if (existing) return existing;

    const newConv: Conversation = {
      id: `conv-${faker.string.uuid()}`,
      participants: [userId, ownerId],
      vehicleId,
      lastActivity: new Date().toISOString(),
      unreadCount: { [userId]: 0, [ownerId]: 0 },
      createdAt: new Date().toISOString(),
    };

    convs.push(newConv);
    localStorage.setItem(CONV_KEY, JSON.stringify(convs));
    return newConv;
  },
};

// ====== STATISTIC SERVICE ======
export const statisticService = {
  async getLandingPageStats(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats', error);
      return null;
    }
  }
};

// ====== LOCATION SERVICE ======
export const locationService = {
  async getTopCities(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/locations/top');
      return response || [];
    } catch (error) {
      console.error('Failed to fetch locations', error);
      return [];
    }
  }
};

// ====== FAQ SERVICE ======
export const faqService = {
  async getFAQs(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/faqs');
      return response || [];
    } catch (error) {
      console.error('Failed to fetch FAQs', error);
      return [];
    }
  }
};
