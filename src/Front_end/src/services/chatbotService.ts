// Service to interact with the Flask Chatbot Backend API
const CHATBOT_BASE_URL = 'http://localhost:5000/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  action_taken: string;
  error?: boolean;
}

export interface BootstrapResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  database_connected: boolean;
}

class ChatbotService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Helper to perform fetch requests to the Chatbot Flask Server.
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`Chatbot Service HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Chatbot API request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * Sends a user query to the chatbot.
   * @param message The user's query string.
   * @param history Conversation history formatted for the backend.
   */
  async sendChatMessage(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  }

  /**
   * Reloads and rebuilds the local vector database from SQL Server.
   */
  async bootstrapVectorDB(): Promise<BootstrapResponse> {
    return this.request<BootstrapResponse>('/bootstrap', {
      method: 'POST',
    });
  }

  /**
   * Checks if the Flask Chatbot server is online and connected.
   */
  async checkChatbotHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health', {
      method: 'GET',
    });
  }
}

export const chatbotService = new ChatbotService(CHATBOT_BASE_URL);
export default chatbotService;
