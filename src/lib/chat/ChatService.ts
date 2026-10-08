import type {
  ChatRepository,
  ConversationModel,
  MessageModel,
  SendMessageInput,
  ChatSubscription,
  MessageFilterOptions,
} from './repositories/ChatRepository';

export interface ChatServiceConfig {
  maxMessageLength?: number;
  floodLimitPerWindow?: number;
  floodWindowMs?: number;
}

/**
 * Enterprise Chat Service (Domain Logic Layer)
 * Depends exclusively on ChatRepository interface.
 * Implements business validation, flood protection, and data sanitization.
 */
export class ChatService {
  private repository: ChatRepository;
  private config: Required<ChatServiceConfig>;
  private sendTimestamps: Map<string, number[]> = new Map();

  constructor(repository: ChatRepository, config: ChatServiceConfig = {}) {
    this.repository = repository;
    this.config = {
      maxMessageLength: config.maxMessageLength || 4000,
      floodLimitPerWindow: config.floodLimitPerWindow || 5,
      floodWindowMs: config.floodWindowMs || 10000, // 10 seconds
    };
  }

  /**
   * Sanitizes and validates message content before persistence
   */
  private validateContent(content: string): string {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error('Message content cannot be empty or whitespace only.');
    }
    if (trimmed.length > this.config.maxMessageLength) {
      throw new Error(`Message length cannot exceed ${this.config.maxMessageLength} characters.`);
    }

    // Basic heuristic: Prevent URL-only spam floods if suspicious
    const urlPattern = /^(https?:\/\/[^\s]+)$/i;
    if (urlPattern.test(trimmed) && trimmed.length > 500) {
      throw new Error('Suspicious excessively long URL rejected.');
    }

    return trimmed;
  }

  /**
   * Application-layer flood / rate-limiting guard per user identity
   */
  private checkFloodThrottling(senderId: string): void {
    const now = Date.now();
    const timestamps = this.sendTimestamps.get(senderId) || [];
    const windowStart = now - this.config.floodWindowMs;

    // Retain only timestamps within the active sliding window
    const recent = timestamps.filter((t) => t > windowStart);
    if (recent.length >= this.config.floodLimitPerWindow) {
      throw new Error('Rate limit exceeded: Please wait a moment before sending more messages.');
    }

    recent.push(now);
    this.sendTimestamps.set(senderId, recent);
  }

  async getConversations(userId: string): Promise<ConversationModel[]> {
    if (!userId) throw new Error('Authenticated user ID required.');
    return this.repository.getConversations(userId);
  }

  async getConversation(conversationId: string, userId: string): Promise<ConversationModel | null> {
    if (!conversationId || !userId) return null;
    return this.repository.getConversationById(conversationId, userId);
  }

  async createConversation(input: {
    type: ConversationModel['type'];
    title?: string;
    participantIds: string[];
    metadata?: Record<string, any>;
    creatorId: string;
  }): Promise<ConversationModel> {
    if (!input.creatorId) throw new Error('Creator ID required.');
    if (!input.participantIds || input.participantIds.length === 0) {
      throw new Error('At least one participant required.');
    }
    return this.repository.createConversation(input);
  }

  async getMessages(conversationId: string, options?: MessageFilterOptions): Promise<MessageModel[]> {
    if (!conversationId) return [];
    return this.repository.getMessages(conversationId, options);
  }

  async sendMessage(input: SendMessageInput, senderId: string): Promise<MessageModel> {
    if (!senderId) throw new Error('Unauthenticated user cannot send message.');
    const sanitizedContent = this.validateContent(input.content);
    this.checkFloodThrottling(senderId);

    return this.repository.sendMessage(
      {
        ...input,
        content: sanitizedContent,
      },
      senderId
    );
  }

  async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new Error('You cannot block yourself.');
    }
    await this.repository.blockUser(blockerId, blockedId, reason);
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await this.repository.unblockUser(blockerId, blockedId);
  }

  async reportMessage(input: {
    reporterId: string;
    reportedUserId: string;
    reportedMessageId?: string;
    reason: string;
  }): Promise<void> {
    if (!input.reason || input.reason.trim().length < 5) {
      throw new Error('Report reason must be at least 5 characters.');
    }
    await this.repository.reportMessage(input);
  }

  subscribeToMessages(
    conversationId: string,
    onMessage: (message: MessageModel) => void
  ): ChatSubscription {
    return this.repository.subscribeToMessages(conversationId, onMessage);
  }
}
