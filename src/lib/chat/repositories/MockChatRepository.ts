import type {
  ChatRepository,
  ConversationModel,
  MessageModel,
  SendMessageInput,
  ChatSubscription,
  MessageFilterOptions,
} from './ChatRepository';

/**
 * In-memory Mock Chat Repository for Unit Testing & Offline Isolation.
 * Demonstrates plug-and-play self-hosting / replacement readiness.
 */
export class MockChatRepository implements ChatRepository {
  private conversations: Map<string, ConversationModel> = new Map();
  private messages: Map<string, MessageModel[]> = new Map();
  private blocks: Set<string> = new Set(); // "blocker:blocked"
  private subscribers: Map<string, Set<(msg: MessageModel) => void>> = new Map();

  constructor(initialConversations?: ConversationModel[]) {
    if (initialConversations) {
      for (const c of initialConversations) {
        this.conversations.set(c.id, c);
        this.messages.set(c.id, []);
      }
    }
  }

  async getConversations(_userId: string): Promise<ConversationModel[]> {
    return Array.from(this.conversations.values());
  }

  async getConversationById(conversationId: string, _userId: string): Promise<ConversationModel | null> {
    return this.conversations.get(conversationId) || null;
  }

  async createConversation(input: {
    type: ConversationModel['type'];
    title?: string;
    participantIds: string[];
    metadata?: Record<string, any>;
    creatorId: string;
  }): Promise<ConversationModel> {
    const id = 'mock-convo-' + Math.random().toString(36).substring(2, 9);
    const convo: ConversationModel = {
      id,
      type: input.type,
      title: input.title,
      createdBy: input.creatorId,
      metadata: input.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(id, convo);
    this.messages.set(id, []);
    return convo;
  }

  async getMessages(conversationId: string, _options?: MessageFilterOptions): Promise<MessageModel[]> {
    const list = this.messages.get(conversationId) || [];
    return [...list];
  }

  async sendMessage(input: SendMessageInput, senderId: string): Promise<MessageModel> {
    const id = 'mock-msg-' + Math.random().toString(36).substring(2, 9);
    const msg: MessageModel = {
      id,
      conversationId: input.conversationId,
      senderId,
      senderName: 'Test Student',
      content: input.content,
      messageType: input.messageType || 'text',
      metadata: input.metadata || {},
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    const current = this.messages.get(input.conversationId) || [];
    current.push(msg);
    this.messages.set(input.conversationId, current);

    // Notify realtime subscribers
    const roomSubs = this.subscribers.get(input.conversationId);
    if (roomSubs) {
      roomSubs.forEach((cb) => cb(msg));
    }

    return msg;
  }

  async blockUser(blockerId: string, blockedId: string, _reason?: string): Promise<void> {
    this.blocks.add(`${blockerId}:${blockedId}`);
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    this.blocks.delete(`${blockerId}:${blockedId}`);
  }

  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    return this.blocks.has(`${blockerId}:${blockedId}`);
  }

  async reportMessage(_input: {
    reporterId: string;
    reportedUserId: string;
    reportedMessageId?: string;
    reason: string;
  }): Promise<void> {
    // Stored in mock ticket registry
  }

  subscribeToMessages(
    conversationId: string,
    onMessage: (message: MessageModel) => void
  ): ChatSubscription {
    if (!this.subscribers.has(conversationId)) {
      this.subscribers.set(conversationId, new Set());
    }
    const set = this.subscribers.get(conversationId)!;
    set.add(onMessage);

    return {
      unsubscribe: () => {
        set.delete(onMessage);
      },
    };
  }
}
