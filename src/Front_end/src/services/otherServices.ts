import { getDb, dbCreate, dbUpdate, STORAGE_KEYS } from '@/mock/db';
import type { Review, Notification, Message, Conversation } from '@/types';
import { faker } from '@faker-js/faker';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// ====== REVIEW SERVICE ======
export const reviewService = {
  async getByVehicle(vehicleId: string): Promise<Review[]> {
    await delay(300);
    const { reviews } = getDb();
    return reviews.filter(r => r.vehicleId === vehicleId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getByUser(userId: string): Promise<Review[]> {
    await delay(300);
    const { reviews } = getDb();
    return reviews.filter(r => r.reviewerId === userId);
  },

  async create(data: Partial<Review>): Promise<Review> {
    await delay(600);
    const { reviews } = getDb();
    const newReview: Review = {
      id: `review-${faker.string.uuid()}`,
      vehicleId: data.vehicleId!,
      bookingId: data.bookingId!,
      reviewerId: data.reviewerId!,
      ownerId: data.ownerId!,
      rating: data.rating!,
      cleanliness: data.cleanliness!,
      accuracy: data.accuracy!,
      communication: data.communication!,
      value: data.value!,
      comment: data.comment!,
      photos: data.photos || [],
      helpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dbCreate(STORAGE_KEYS.REVIEWS, reviews, newReview);
    return newReview;
  },

  async getAll(): Promise<Review[]> {
    await delay(300);
    const { reviews } = getDb();
    return reviews;
  },
};

// ====== NOTIFICATION SERVICE ======
export const notificationService = {
  async getByUser(userId: string): Promise<Notification[]> {
    await delay(200);
    const { notifications } = getDb();
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async markRead(notificationId: string): Promise<void> {
    await delay(100);
    const { notifications } = getDb();
    dbUpdate(STORAGE_KEYS.NOTIFICATIONS, notifications, notificationId, { read: true } as Partial<Notification>);
  },

  async markAllRead(userId: string): Promise<void> {
    await delay(200);
    const { notifications } = getDb();
    notifications
      .filter(n => n.userId === userId && !n.read)
      .forEach(n => {
        dbUpdate(STORAGE_KEYS.NOTIFICATIONS, notifications, n.id, { read: true } as Partial<Notification>);
      });
  },

  async create(data: Partial<Notification>): Promise<Notification> {
    const { notifications } = getDb();
    const notification: Notification = {
      id: `notification-${faker.string.uuid()}`,
      userId: data.userId!,
      type: data.type || 'system',
      title: data.title!,
      body: data.body!,
      read: false,
      createdAt: new Date().toISOString(),
      ...data,
    } as Notification;
    dbCreate(STORAGE_KEYS.NOTIFICATIONS, notifications, notification);
    return notification;
  },

  getUnreadCount(userId: string): number {
    const { notifications } = getDb();
    return notifications.filter(n => n.userId === userId && !n.read).length;
  },
};

// ====== MESSAGE SERVICE ======
export const messageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    await delay(300);
    const { conversations, messages } = getDb();
    const userConvs = conversations.filter(c => c.participants.includes(userId));

    // Attach last message
    return userConvs.map(conv => {
      const convMessages = messages.filter(m => m.conversationId === conv.id);
      const lastMessage = convMessages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      return { ...conv, lastMessage };
    }).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    await delay(200);
    const { messages } = getDb();
    return messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<Message> {
    const { messages, conversations } = getDb();
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
    dbCreate(STORAGE_KEYS.MESSAGES, messages, newMessage);

    // Update conversation last activity
    dbUpdate(STORAGE_KEYS.CONVERSATIONS, conversations, conversationId, {
      lastActivity: new Date().toISOString(),
    } as Partial<Conversation>);

    return newMessage;
  },

  async createConversation(userId: string, ownerId: string, vehicleId?: string): Promise<Conversation> {
    await delay(300);
    const { conversations } = getDb();

    // Check if conversation already exists
    const existing = conversations.find(c =>
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

    dbCreate(STORAGE_KEYS.CONVERSATIONS, conversations, newConv);
    return newConv;
  },
};
