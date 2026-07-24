// ====== HELP CENTER SERVICE ======
// All data comes from real backend — no mocks, no fallbacks that hide errors.
import apiClient from './api';

const BASE = '/help';
const SUPPORT = '/support';

export interface HelpCategory {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  displayOrder: number;
  articleCount: number;
}

export interface HelpArticle {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  tags: string;
  viewCount: number;
  categorySlug: string;
  categoryTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: number;
  subject: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
  userId: string;
  userName: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
  messageCount?: number;
}

export interface TicketMessage {
  id: number;
  senderType: 'USER' | 'AGENT';
  message: string;
  createdAt: string;
}

export interface CreateTicketPayload {
  subject: string;
  category: string;
  priority: string;
  bookingId?: string;
  message: string;
}

// ======= Knowledge Base =======

export const helpService = {

  /** Fetch all active help categories with article counts */
  async getCategories(): Promise<HelpCategory[]> {
    const res = await apiClient.get<any>(`${BASE}/categories`);
    return res?.data ?? [];
  },

  /** Fetch all published articles for a category slug */
  async getArticlesByCategory(slug: string): Promise<HelpArticle[]> {
    const res = await apiClient.get<any>(`${BASE}/categories/${slug}/articles`);
    return res?.data ?? [];
  },

  /** Fetch a single article by ID (server increments view count) */
  async getArticle(id: number): Promise<HelpArticle | null> {
    const res = await apiClient.get<any>(`${BASE}/articles/${id}`);
    return res?.data ?? null;
  },

  /** Full-text search across all published articles */
  async searchArticles(query: string): Promise<HelpArticle[]> {
    if (!query.trim()) return [];
    const res = await apiClient.get<any>(`${BASE}/search?q=${encodeURIComponent(query)}`);
    return res?.data ?? [];
  },
};

// ======= Support Tickets =======

export const ticketService = {

  /** Submit a new support ticket (requires authentication) */
  async createTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
    const res = await apiClient.post<any>(`${SUPPORT}/tickets`, payload);
    return res?.data;
  },

  /** Get all tickets submitted by the current user */
  async getMyTickets(): Promise<SupportTicket[]> {
    const res = await apiClient.get<any>(`${SUPPORT}/tickets/my`);
    return res?.data ?? [];
  },

  /** Get ticket detail with message thread */
  async getTicketDetail(id: number): Promise<SupportTicket | null> {
    const res = await apiClient.get<any>(`${SUPPORT}/tickets/${id}`);
    return res?.data ?? null;
  },

  /** Add a reply to a ticket */
  async reply(id: number, message: string): Promise<SupportTicket> {
    const res = await apiClient.post<any>(`${SUPPORT}/tickets/${id}/reply`, { message });
    return res?.data;
  },
};

// ======= AI Concierge Service =======
export const aiConciergeService = {
  async chat(
    sessionId: string, 
    message: string, 
    currentPage?: string, 
    activeVehicleId?: string, 
    activeBookingId?: string
  ): Promise<any> {
    const res = await apiClient.post<any>('/ai/chat', { 
      sessionId, 
      message, 
      currentPage, 
      activeVehicleId, 
      activeBookingId 
    });
    return res?.data;
  },
  async executeAction(actionType: string, targetId?: string): Promise<any> {
    const res = await apiClient.post<any>('/ai/execute-action', { actionType, targetId });
    return res?.data;
  },
  async getHistory(sessionId: string): Promise<any[]> {
    const res = await apiClient.get<any>(`/ai/history?sessionId=${sessionId}`);
    return res?.data ?? [];
  },
  async submitFeedback(payload: {
    sessionId: string;
    messageId: string;
    isPositive: boolean;
    feedbackText?: string;
  }): Promise<any> {
    const res = await apiClient.post<any>('/ai/feedback', payload);
    return res?.data;
  },
  async getPreferences(): Promise<any> {
    const res = await apiClient.get<any>('/ai/preferences');
    return res?.data;
  },
  async savePreferences(payload: {
    preferredLanguage: string;
    voiceEnabled: boolean;
    preferredVehicleType?: string;
  }): Promise<any> {
    const res = await apiClient.post<any>('/ai/preferences', payload);
    return res?.data;
  }
};

// ======= Enterprise Knowledge Base =======
export const kbService = {
  async getKBCategories(): Promise<any[]> {
    const res = await apiClient.get<any>(`${SUPPORT}/kb/categories`);
    return res?.data ?? [];
  },
  async getKBArticles(categoryId?: number, query?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (query) params.append('query', query);
    const res = await apiClient.get<any>(`${SUPPORT}/kb/articles?${params.toString()}`);
    return res?.data ?? [];
  },
  async getKBArticleBySlug(slug: string): Promise<any> {
    const res = await apiClient.get<any>(`${SUPPORT}/kb/articles/${slug}`);
    return res?.data ?? null;
  }
};

// ======= Support Tickets V2 =======
export const ticketV2Service = {
  async createTicketV2(payload: {
    subject: string;
    description: string;
    categoryId?: number | string;
    priorityId?: number | string;
    bookingId?: string;
    vehicleId?: string;
  }): Promise<any> {
    const res = await apiClient.post<any>(`${SUPPORT}/tickets-v2`, payload);
    return res?.data;
  },
  async getMyTicketsV2(): Promise<any[]> {
    const res = await apiClient.get<any>(`${SUPPORT}/tickets-v2/my`);
    return res?.data ?? [];
  },
  async getTicketV2Detail(id: string): Promise<any> {
    const res = await apiClient.get<any>(`${SUPPORT}/tickets-v2/${id}`);
    return res?.data ?? null;
  },
  async replyToTicketV2(id: string, content: string): Promise<any> {
    const res = await apiClient.post<any>(`${SUPPORT}/tickets-v2/${id}/messages`, { content });
    return res?.data;
  },
  async getAllTicketsV2(): Promise<any[]> {
    const res = await apiClient.get<any>(`${SUPPORT}/tickets-v2`);
    return res?.data ?? [];
  }
};

// ======= Emergency Service =======
export const emergencyService = {
  async submitEmergency(payload: {
    emergencyType: string;
    description: string;
    contactPhone: string;
    bookingId?: string;
    vehicleId?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<any> {
    const res = await apiClient.post<any>(`${SUPPORT}/emergency`, payload);
    return res?.data;
  },
  async getMyEmergencies(): Promise<any[]> {
    const res = await apiClient.get<any>(`${SUPPORT}/emergency/my`);
    return res?.data ?? [];
  },
  async getAllEmergencies(): Promise<any[]> {
    const res = await apiClient.get<any>(`${SUPPORT}/emergency`);
    return res?.data ?? [];
  }
};

// ======= Delivery Tracking & Simulation =======
export const deliverySimService = {
  async initDeliveryTracking(bookingId: string): Promise<any> {
    const res = await apiClient.post<any>(`${SUPPORT}/delivery/tracking`, { bookingId });
    return res?.data;
  },
  async getDeliveryTracking(bookingId: string): Promise<any> {
    const res = await apiClient.get<any>(`${SUPPORT}/delivery/tracking/${bookingId}`);
    return res?.data ?? null;
  },
  async stepDeliveryTracking(bookingId: string): Promise<any> {
    const res = await apiClient.post<any>(`${SUPPORT}/delivery/tracking/${bookingId}/step`, {});
    return res?.data;
  }
};

// ======= Platform Status =======
export const platformStatusService = {
  async getStatus(): Promise<any[]> {
    const res = await apiClient.get<any>(`${SUPPORT}/status`);
    return res?.data ?? [];
  },
  async updateStatus(payload: { serviceName: string; status: string; description: string }): Promise<any> {
    const res = await apiClient.post<any>(`${SUPPORT}/status`, payload);
    return res?.data;
  }
};

// ======= Owner Requests =======
export const ownerRequestService = {
  async submitOwnerRequest(payload: {
    requestType: string;
    subject: string;
    details: string;
  }): Promise<any> {
    const res = await apiClient.post<any>(`${SUPPORT}/owner/requests`, payload);
    return res?.data;
  },
  async getMyOwnerRequests(): Promise<any[]> {
    const res = await apiClient.get<any>(`${SUPPORT}/owner/requests`);
    return res?.data ?? [];
  }
};

