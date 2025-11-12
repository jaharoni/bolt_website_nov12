export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  message: ChatMessage;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  sessionId: string;
}

export interface ChatError {
  error: string;
  type?: 'rate_limit' | 'budget_limit' | 'content_moderation' | 'policy_violation';
  cooldownSeconds?: number;
  categories?: string[];
  currentCost?: number;
  dailyLimit?: number;
}

class SecureChatService {
  private sessionId: string;
  private apiUrl: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.apiUrl = '/api';
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  }

  async chat(
    messages: ChatMessage[],
    turnstileToken: string
  ): Promise<ChatResponse> {
    if (!turnstileToken) {
      throw new Error('Turnstile verification required');
    }

    const response = await fetch(`${this.apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': this.sessionId,
        'X-Turnstile-Token': turnstileToken,
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ChatError;
      throw new ChatServiceError(error.error, error);
    }

    return data as ChatResponse;
  }

  getRemainingQuota(headers: Headers): { hourly: number; daily: number } {
    return {
      hourly: parseInt(headers.get('X-Rate-Limit-Remaining-Hourly') || '0'),
      daily: parseInt(headers.get('X-Rate-Limit-Remaining-Daily') || '0'),
    };
  }
}

export class ChatServiceError extends Error {
  type?: string;
  cooldownSeconds?: number;
  categories?: string[];
  currentCost?: number;
  dailyLimit?: number;

  constructor(message: string, details?: Partial<ChatError>) {
    super(message);
    this.name = 'ChatServiceError';
    Object.assign(this, details);
  }

  getUserFriendlyMessage(): string {
    if (this.type === 'rate_limit') {
      if (this.cooldownSeconds) {
        const minutes = Math.ceil(this.cooldownSeconds / 60);
        if (minutes > 60) {
          const hours = Math.ceil(minutes / 60);
          return `You've reached your limit. Please wait ${hours} hour${hours > 1 ? 's' : ''} before trying again.`;
        }
        return `You've reached your limit. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
      }
      return 'You\'ve reached your rate limit. Please try again later.';
    }

    if (this.type === 'budget_limit') {
      return 'Our AI service is temporarily unavailable due to high usage. Please try again later.';
    }

    if (this.type === 'content_moderation') {
      return 'Your message was flagged by our content filter. We maintain a family-friendly environment. Please rephrase your message.';
    }

    if (this.type === 'policy_violation') {
      return 'Your message appears to violate our usage policy. Please rephrase your question.';
    }

    return this.message || 'An error occurred. Please try again.';
  }
}

export const secureChatService = new SecureChatService();
