import apiClient from './api';
import type { Review, Notification, Message, Conversation } from '@/types';
import { faker } from '@faker-js/faker';

// Helper function to map backend review DTO to frontend Review interface
const mapReview = (r: any): Review => {
  if (!r) return r;
  return {
    ...r,
    reviewerId: r.reviewer?.id || r.reviewerId || 'anonymous',
    photos: r.photos || [],
    cleanliness: r.cleanliness || 5,
    accuracy: r.accuracy || 5,
    communication: r.communication || 5,
    value: r.value !== undefined ? r.value : (r.valueRating !== undefined ? r.valueRating : 5),
    rating: r.rating || r.averageRating || 5
  };
};

// ====== REVIEW SERVICE ======
export const reviewService = {
  async getByVehicle(vehicleId: string): Promise<Review[]> {
    try {
      const response = await apiClient.get<any>(`/reviews/vehicle/${vehicleId}?page=0&size=50`);
      return (response.data?.content || []).map(mapReview);
    } catch (error) {
      return [];
    }
  },

  async getByUser(userId: string): Promise<Review[]> {
    try {
      const response = await apiClient.get<any>(`/reviews/user/${userId}?page=0&size=50`);
      return (response.data?.content || []).map(mapReview);
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
      valueRating: data.value !== undefined ? data.value : 5, // DTO expects valueRating
      comment: data.comment,
    };
    const response = await apiClient.post<any>('/reviews', payload);
    return response.data ? mapReview(response.data) : (payload as any as Review);
  },

  async getAll(page = 0, size = 10, rating?: number, search?: string): Promise<{ content: Review[]; totalElements: number; totalPages: number }> {
    try {
      let url = `/reviews?page=${page}&size=${size}`;
      if (rating !== undefined && rating !== null) url += `&rating=${rating}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const response = await apiClient.get<any>(url);
      const data = response.data?.data || response.data;
      const content = (data?.content || []).map(mapReview);
      const totalElements = response.data?.meta?.totalElements || data?.totalElements || 0;
      const totalPages = response.data?.meta?.totalPages || data?.totalPages || 0;
      return { content, totalElements, totalPages };
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  async getStats(vehicleId?: string, ownerId?: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    cleanlinessAverage: number;
    accuracyAverage: number;
    communicationAverage: number;
    valueAverage: number;
  }> {
    try {
      let url = '/reviews/stats';
      const params = [];
      if (vehicleId) params.push(`vehicleId=${vehicleId}`);
      if (ownerId) params.push(`ownerId=${ownerId}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      
      const response = await apiClient.get<any>(url);
      const stats = response.data?.data || response.data;
      return {
        averageRating: stats?.averageRating || 0,
        totalReviews: stats?.totalReviews || 0,
        ratingDistribution: stats?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        cleanlinessAverage: stats?.cleanlinessAverage || 0,
        accuracyAverage: stats?.accuracyAverage || 0,
        communicationAverage: stats?.communicationAverage || 0,
        valueAverage: stats?.valueAverage || 0,
      };
    } catch (error) {
      console.error('Failed to fetch review stats', error);
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        cleanlinessAverage: 0,
        accuracyAverage: 0,
        communicationAverage: 0,
        valueAverage: 0,
      };
    }
  },

  async getByOwner(ownerId: string, page = 0, size = 10): Promise<{ content: Review[]; totalElements: number; totalPages: number }> {
    try {
      const response = await apiClient.get<any>(`/reviews/owner/${ownerId}?page=${page}&size=${size}`);
      const data = response.data?.data || response.data;
      const content = (data?.content || []).map(mapReview);
      const totalElements = response.data?.meta?.totalElements || data?.totalElements || 0;
      const totalPages = response.data?.meta?.totalPages || data?.totalPages || 0;
      return { content, totalElements, totalPages };
    } catch (error) {
      console.error('Failed to fetch owner reviews', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  async getFeaturedReviews(): Promise<Review[]> {
    try {
      const response = await apiClient.get<any>('/reviews/featured?limit=3');
      return (response.data?.content || response.data?.data?.content || []).map(mapReview);
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

// ====== MESSAGE SERVICE ======
export const messageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<any>('/chat/conversations');
      const convs = response.data?.data || [];
      return convs.map((c: any) => ({
        ...c,
        participants: (c.participants || []).map((p: any) => typeof p === 'string' ? p : p.id)
      }));
    } catch (error) {
      console.error('Failed to fetch conversations', error);
      return [];
    }
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await apiClient.get<any>(`/chat/conversations/${conversationId}/messages`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Failed to fetch messages', error);
      return [];
    }
  },

  async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<Message> {
    const response = await apiClient.post<any>('/chat/messages', {
      conversationId,
      receiverId,
      content
    });
    return response.data?.data;
  },

  async createConversation(userId: string, ownerId: string, vehicleId?: string): Promise<Conversation> {
    const response = await apiClient.post<any>('/chat/conversations', {
      otherId: ownerId,
      vehicleId
    });
    const c = response.data?.data;
    return {
      ...c,
      participants: (c.participants || []).map((p: any) => typeof p === 'string' ? p : p.id)
    };
  },
};

// ====== STATISTIC SERVICE ======
export const statisticService = {
  async getLandingPageStats(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/stats');
      return response;
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
