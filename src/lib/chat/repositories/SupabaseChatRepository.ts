import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ChatRepository,
  ConversationModel,
  MessageModel,
  SendMessageInput,
  ChatSubscription,
  MessageFilterOptions,
} from './ChatRepository';

/**
 * Supabase-backed implementation of ChatRepository.
 * Uses constructor-injected client and parameterized queries.
 */
export class SupabaseChatRepository implements ChatRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async getConversations(userId: string): Promise<ConversationModel[]> {
    // 1. Fetch conversations that user is a participant of
    const { data: participants, error: pError } = await this.client
      .from('conversation_participants')
      .select('conversation_id, last_read_at, conversations(*)')
      .eq('profile_id', userId);

    if (pError || !participants) {
      console.warn('Failed to fetch conversations:', pError);
      return [];
    }

    const conversations: ConversationModel[] = [];

    for (const p of participants) {
      const c = (p as any).conversations;
      if (!c) continue;

      // 2. Fetch last message for each conversation
      const { data: lastMsgs } = await this.client
        .from('chat_messages')
        .select('id, conversation_id, sender_id, content, message_type, created_at, profiles(full_name, roll_number)')
        .eq('conversation_id', c.id)
        .order('created_at', { ascending: false })
        .limit(1);

      let lastMessage: MessageModel | undefined;
      if (lastMsgs && lastMsgs.length > 0) {
        const m = lastMsgs[0] as any;
        lastMessage = {
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          senderName: m.profiles?.full_name || 'Collaborator',
          senderRollNumber: m.profiles?.roll_number,
          content: m.content,
          messageType: m.message_type || 'text',
          status: 'sent',
          createdAt: m.created_at,
        };
      }

      conversations.push({
        id: c.id,
        type: c.type,
        title: c.title,
        createdBy: c.created_by,
        metadata: c.metadata || {},
        lastMessage,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      });
    }

    return conversations;
  }

  async getConversationById(conversationId: string, _userId: string): Promise<ConversationModel | null> {
    const { data: conv, error } = await this.client
      .from('conversations')
      .select('*, conversation_participants(profile_id, role, profiles(id, full_name, roll_number, department))')
      .eq('id', conversationId)
      .single();

    if (error || !conv) return null;

    const participants = ((conv as any).conversation_participants || []).map((cp: any) => ({
      id: cp.profiles?.id || cp.profile_id,
      fullName: cp.profiles?.full_name || 'Member',
      rollNumber: cp.profiles?.roll_number,
      department: cp.profiles?.department,
      role: cp.role,
    }));

    return {
      id: conv.id,
      type: conv.type,
      title: conv.title,
      createdBy: conv.created_by,
      metadata: conv.metadata || {},
      participants,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
    };
  }

  async createConversation(input: {
    type: ConversationModel['type'];
    title?: string;
    participantIds: string[];
    metadata?: Record<string, any>;
    creatorId: string;
  }): Promise<ConversationModel> {
    const { data: conv, error: cErr } = await this.client
      .from('conversations')
      .insert({
        type: input.type,
        title: input.title,
        created_by: input.creatorId,
        metadata: input.metadata || { retention_days: 30 },
      })
      .select()
      .single();

    if (cErr || !conv) {
      throw new Error(`Failed to create conversation: ${cErr?.message || 'Unknown error'}`);
    }

    const uniqueParticipants = Array.from(new Set([input.creatorId, ...input.participantIds]));
    const participantsPayload = uniqueParticipants.map((pid) => ({
      conversation_id: conv.id,
      profile_id: pid,
      role: pid === input.creatorId ? 'admin' : 'member',
    }));

    await this.client.from('conversation_participants').insert(participantsPayload);

    return {
      id: conv.id,
      type: conv.type,
      title: conv.title,
      createdBy: conv.created_by,
      metadata: conv.metadata || {},
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
    };
  }

  async getMessages(conversationId: string, options?: MessageFilterOptions): Promise<MessageModel[]> {
    let query = this.client
      .from('chat_messages')
      .select('id, conversation_id, sender_id, content, message_type, metadata, is_deleted, created_at, profiles(full_name, roll_number)')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(options?.limit || 30);

    if (options?.beforeCreatedAt) {
      query = query.lt('created_at', options.beforeCreatedAt);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn('Failed to fetch messages:', error);
      return [];
    }

    return data.map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: m.profiles?.full_name || 'Collaborator',
      senderRollNumber: m.profiles?.roll_number,
      content: m.content,
      messageType: m.message_type || 'text',
      metadata: m.metadata || {},
      status: 'sent',
      createdAt: m.created_at,
    }));
  }

  async sendMessage(input: SendMessageInput, senderId: string): Promise<MessageModel> {
    const payload = {
      conversation_id: input.conversationId,
      sender_id: senderId,
      content: input.content,
      message_type: input.messageType || 'text',
      metadata: input.metadata || {},
    };

    const { data, error } = await this.client
      .from('chat_messages')
      .insert(payload)
      .select('id, conversation_id, sender_id, content, message_type, metadata, created_at, profiles(full_name, roll_number)')
      .single();

    if (error || !data) {
      throw new Error(`Failed to send message: ${error?.message || 'Database error'}`);
    }

    const m = data as any;
    return {
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: m.profiles?.full_name || 'Collaborator',
      senderRollNumber: m.profiles?.roll_number,
      content: m.content,
      messageType: m.message_type || 'text',
      metadata: m.metadata || {},
      status: 'sent',
      createdAt: m.created_at,
    };
  }

  async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void> {
    const { error } = await this.client.from('chat_user_blocks').insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
      reason: reason || 'User requested block',
    });
    if (error && !error.message.includes('unique')) {
      throw new Error(`Failed to block user: ${error.message}`);
    }
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await this.client
      .from('chat_user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);
  }

  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const { data } = await this.client
      .from('chat_user_blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .maybeSingle();

    return !!data;
  }

  async reportMessage(input: {
    reporterId: string;
    reportedUserId: string;
    reportedMessageId?: string;
    reason: string;
  }): Promise<void> {
    const { error } = await this.client.from('chat_moderation_reports').insert({
      reporter_id: input.reporterId,
      reported_user_id: input.reportedUserId,
      reported_message_id: input.reportedMessageId || null,
      reason: input.reason,
    });
    if (error) {
      throw new Error(`Failed to submit report: ${error.message}`);
    }
  }

  subscribeToMessages(
    conversationId: string,
    onMessage: (message: MessageModel) => void
  ): ChatSubscription {
    const channelName = `chat:room:${conversationId}`;
    const channel = this.client
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          const row = payload.new;
          if (!row || row.is_deleted) return;

          onMessage({
            id: row.id,
            conversationId: row.conversation_id,
            senderId: row.sender_id,
            content: row.content,
            messageType: row.message_type || 'text',
            metadata: row.metadata || {},
            status: 'sent',
            createdAt: row.created_at,
          });
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        this.client.removeChannel(channel);
      },
    };
  }
}
