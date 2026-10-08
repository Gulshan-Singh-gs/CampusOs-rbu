import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatService } from '@/lib/chat/ChatService';
import { SupabaseChatRepository } from '@/lib/chat/repositories/SupabaseChatRepository';
import { supabase } from '@/shared/lib/supabase';
import type { MessageModel, ConversationModel, SendMessageInput } from '@/lib/chat/repositories/ChatRepository';

// Singleton instance injecting the SupabaseChatRepository into ChatService
const chatRepositoryInstance = new SupabaseChatRepository(supabase);
export const defaultChatService = new ChatService(chatRepositoryInstance);

export interface UseChatOptions {
  conversationId: string;
  userId?: string;
  chatService?: ChatService;
}

export function useChat({ conversationId, userId, chatService = defaultChatService }: UseChatOptions) {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [conversations, setConversations] = useState<ConversationModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  // 1. Load Messages with initial page of 30
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const msgs = await chatService.getMessages(conversationId, { limit: 30 });
      setMessages(msgs);
    } catch (err: any) {
      setError(err?.message || 'Failed to load messages.');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, chatService]);

  // 2. Fetch User Conversations
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await chatService.getConversations(userId);
      setConversations(list);
    } catch (err: any) {
      console.warn('Could not load conversations:', err);
    }
  }, [userId, chatService]);

  // 3. Realtime Subscription Setup
  useEffect(() => {
    loadMessages();
    loadConversations();

    if (conversationId) {
      subscriptionRef.current = chatService.subscribeToMessages(conversationId, (newMsg) => {
        setMessages((prev) => {
          // Avoid duplicate incoming messages if already optimistically added
          if (prev.some((m) => m.id === newMsg.id)) {
            return prev.map((m) => (m.id === newMsg.id ? newMsg : m));
          }
          return [...prev, newMsg];
        });
      });
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [conversationId, loadMessages, loadConversations, chatService]);

  // 4. Send Message with Optimistic UI & Rollback
  const sendMessage = useCallback(
    async (input: Omit<SendMessageInput, 'conversationId'>) => {
      if (!userId) {
        throw new Error('You must be signed in to send a message.');
      }

      const tempId = 'temp-' + crypto.randomUUID();
      const optimisticMessage: MessageModel = {
        id: tempId,
        conversationId,
        senderId: userId,
        content: input.content,
        messageType: input.messageType || 'text',
        status: 'sending',
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setMessages((prev) => [...prev, optimisticMessage]);
      setIsSending(true);
      setError(null);

      try {
        const persisted = await chatService.sendMessage(
          {
            conversationId,
            content: input.content,
            messageType: input.messageType,
            metadata: input.metadata,
          },
          userId
        );

        // Replace optimistic placeholder with server-persisted message
        setMessages((prev) => prev.map((m) => (m.id === tempId ? persisted : m)));
        return persisted;
      } catch (err: any) {
        // Mark failed or rollback with error preserve
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  status: 'failed',
                }
              : m
          )
        );
        const errMsg = err?.message || 'Failed to send message.';
        setError(errMsg);
        throw new Error(errMsg);
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, userId, chatService]
  );

  // 5. Block User Action
  const blockUser = useCallback(
    async (targetUserId: string, reason?: string) => {
      if (!userId) return;
      await chatService.blockUser(userId, targetUserId, reason);
      // Remove messages from blocked user in local view
      setMessages((prev) => prev.filter((m) => m.senderId !== targetUserId));
    },
    [userId, chatService]
  );

  // 6. Report Message Action
  const reportMessage = useCallback(
    async (reportedUserId: string, messageId: string, reason: string) => {
      if (!userId) return;
      await chatService.reportMessage({
        reporterId: userId,
        reportedUserId,
        reportedMessageId: messageId,
        reason,
      });
    },
    [userId, chatService]
  );

  return {
    messages,
    conversations,
    isLoading,
    isSending,
    error,
    sendMessage,
    blockUser,
    reportMessage,
    refreshMessages: loadMessages,
  };
}
