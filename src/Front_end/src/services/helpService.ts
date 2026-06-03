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
