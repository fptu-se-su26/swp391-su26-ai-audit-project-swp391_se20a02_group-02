import { generateUsers } from './users';
import { generateVehicles } from './vehicles';
import {
  generateBookings,
  generatePayments,
  generateReviews,
  generateNotifications,
  generateMessages,
  generateConversations,
  generateBusinesses,
  generateAnalytics,
} from './data';
import type { User, Vehicle, Booking, Payment, Review, Notification, Message, Conversation, Business, AnalyticsData } from '@/types';

// ====== STORAGE KEYS ======
export const STORAGE_KEYS = {
  USERS: 'luxeway_users',
  VEHICLES: 'luxeway_vehicles',
  BOOKINGS: 'luxeway_bookings',
  PAYMENTS: 'luxeway_payments',
  REVIEWS: 'luxeway_reviews',
  NOTIFICATIONS: 'luxeway_notifications',
  MESSAGES: 'luxeway_messages',
  CONVERSATIONS: 'luxeway_conversations',
  BUSINESSES: 'luxeway_businesses',
  ANALYTICS: 'luxeway_analytics',
  INITIALIZED: 'luxeway_db_initialized',
  CURRENT_USER: 'luxeway_current_user',
};

// ====== DATABASE STATE ======
interface Database {
  users: User[];
  vehicles: Vehicle[];
  bookings: Booking[];
  payments: Payment[];
  reviews: Review[];
  notifications: Notification[];
  messages: Message[];
  conversations: Conversation[];
  businesses: Business[];
  analytics: AnalyticsData[];
}

let db: Database | null = null;

// ====== LOAD FROM STORAGE ======
function loadFromStorage<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// ====== SAVE TO STORAGE ======
export function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e);
  }
}

// ====== INITIALIZE DATABASE ======
export function initializeDatabase(): Database {
  if (db) return db;

  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

  if (!isInitialized) {
    console.log('🚀 LuxeWay: Seeding fake database...');

    const users = generateUsers();
    const vehicles = generateVehicles();
    const bookings = generateBookings();
    const payments = generatePayments();
    const reviews = generateReviews();
    const notifications = generateNotifications();
    const messages = generateMessages();
    const conversations = generateConversations();
    const businesses = generateBusinesses();
    const analytics = generateAnalytics();

    saveToStorage(STORAGE_KEYS.USERS, users);
    saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);
    saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
    saveToStorage(STORAGE_KEYS.BUSINESSES, businesses);
    saveToStorage(STORAGE_KEYS.ANALYTICS, analytics);

    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    db = { users, vehicles, bookings, payments, reviews, notifications, messages, conversations, businesses, analytics };

    console.log(`✅ LuxeWay DB seeded: ${users.length} users, ${vehicles.length} vehicles, ${bookings.length} bookings`);
  } else {
    db = {
      users: loadFromStorage<User>(STORAGE_KEYS.USERS),
      vehicles: loadFromStorage<Vehicle>(STORAGE_KEYS.VEHICLES),
      bookings: loadFromStorage<Booking>(STORAGE_KEYS.BOOKINGS),
      payments: loadFromStorage<Payment>(STORAGE_KEYS.PAYMENTS),
      reviews: loadFromStorage<Review>(STORAGE_KEYS.REVIEWS),
      notifications: loadFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS),
      messages: loadFromStorage<Message>(STORAGE_KEYS.MESSAGES),
      conversations: loadFromStorage<Conversation>(STORAGE_KEYS.CONVERSATIONS),
      businesses: loadFromStorage<Business>(STORAGE_KEYS.BUSINESSES),
      analytics: loadFromStorage<AnalyticsData>(STORAGE_KEYS.ANALYTICS),
    };
  }

  return db;
}

// ====== GET DATABASE ======
export function getDb(): Database {
  if (!db) return initializeDatabase();
  return db;
}

// ====== RESET DATABASE ======
export function resetDatabase(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  db = null;
  initializeDatabase();
}

// ====== GENERIC CRUD HELPERS ======
export function dbFind<T extends { id: string }>(collection: T[], id: string): T | undefined {
  return collection.find(item => item.id === id);
}

export function dbFilter<T>(collection: T[], predicate: (item: T) => boolean): T[] {
  return collection.filter(predicate);
}

export function dbCreate<T extends { id: string }>(storageKey: string, collection: T[], item: T): T {
  collection.push(item);
  saveToStorage(storageKey, collection);
  return item;
}

export function dbUpdate<T extends { id: string }>(storageKey: string, collection: T[], id: string, updates: Partial<T>): T | null {
  const idx = collection.findIndex(item => item.id === id);
  if (idx === -1) return null;
  collection[idx] = { ...collection[idx], ...updates };
  saveToStorage(storageKey, collection);
  return collection[idx];
}

export function dbDelete<T extends { id: string }>(storageKey: string, collection: T[], id: string): boolean {
  const idx = collection.findIndex(item => item.id === id);
  if (idx === -1) return false;
  collection.splice(idx, 1);
  saveToStorage(storageKey, collection);
  return true;
}
