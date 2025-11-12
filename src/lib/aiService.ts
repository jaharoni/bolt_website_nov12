// This file is deprecated and no longer used.
// All AI chat functionality now routes through secureChatService.ts
// which uses Supabase Edge Functions for secure server-side processing.
//
// DO NOT import or use this file. Use secureChatService instead.

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIResponse {
  message: string;
  suggestedRoute?: string;
  intent?: string;
  confidence?: number;
}

class AIService {
  isConfigured(): boolean {
    console.warn('aiService.ts is deprecated. Use secureChatService.ts instead.');
    return false;
  }

  async chat(): Promise<AIResponse> {
    throw new Error('This service is deprecated. Use secureChatService instead.');
  }

  async chatStream(): Promise<void> {
    throw new Error('This service is deprecated. Use secureChatService instead.');
  }
}

export const aiService = new AIService();
