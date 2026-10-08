/**
 * Enterprise Chat Subsystem: Domain Models & Repository Interface
 * Self-Hosting Insurance: Business logic and UI depend strictly on this abstraction.
 */

export interface ChatUserSummary {
  id: string;
  fullName: string;
  rollNumber?: string;
  department?: string;
  avatarUrl?: string;
  role?: string;
}

export interface ConversationModel {
  id: string;
  type: 'direct' | 'group' | 'ephemeral' | 'course_channel';
  title?: string;
  createdBy?: string;
  metadata: {
    retention_days?: number;
    is_encrypted?: boolean;
    [key: string]: any;
  };
  unreadCount?: number;
  lastMessage?: MessageModel;
  participants?: ChatUserSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageModel {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderRollNumber?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, any>;
  isDeleted?: boolean;
  status?: 'sending' | 'sent' | 'failed';
  createdAt: string;
  updatedAt?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, any>;
}

export interface ChatSubscription {
  unsubscribe: () => void;
}

export interface MessageFilterOptions {
  limit?: number;
  beforeCreatedAt?: string;
}

export interface ChatRepository {
  getConversations(userId: string): Promise<ConversationModel[]>;
  getConversationById(conversationId: string, userId: string): Promise<ConversationModel | null>;
  createConversation(input: {
    type: ConversationModel['type'];
    title?: string;
    participantIds: string[];
    metadata?: Record<string, any>;
    creatorId: string;
  }): Promise<ConversationModel>;
  
  getMessages(conversationId: string, options?: MessageFilterOptions): Promise<MessageModel[]>;
  sendMessage(input: SendMessageInput, senderId: string): Promise<MessageModel>;
  
  blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void>;
  unblockUser(blockerId: string, blockedId: string): Promise<void>;
  isUserBlocked(blockerId: string, blockedId: string): Promise<boolean>;
  
  reportMessage(input: {
    reporterId: string;
    reportedUserId: string;
    reportedMessageId?: string;
    reason: string;
  }): Promise<void>;
  
  subscribeToMessages(
    conversationId: string,
    onMessage: (message: MessageModel) => void
  ): ChatSubscription;
}
