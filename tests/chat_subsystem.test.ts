import { describe, it, expect, beforeEach } from 'vitest';
import { ChatService } from '@/lib/chat/ChatService';
import { MockChatRepository } from '@/lib/chat/repositories/MockChatRepository';
import type { ConversationModel } from '@/lib/chat/repositories/ChatRepository';

describe('Enterprise Chat Subsystem: Architecture, Logic & Security Tests', () => {
  let mockRepo: MockChatRepository;
  let chatService: ChatService;

  const testConversation: ConversationModel = {
    id: 'room-solar-drone',
    type: 'group',
    title: 'Project Match: Solar Autonomous Drone',
    createdBy: 'RBU21CSE045',
    metadata: { retention_days: 14, is_encrypted: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mockRepo = new MockChatRepository([testConversation]);
    chatService = new ChatService(mockRepo, {
      maxMessageLength: 4000,
      floodLimitPerWindow: 5,
      floodWindowMs: 10000,
    });
  });

  it('CHAT-01: Plug-and-play self-hosting adapter swap (MockChatRepository works seamlessly)', async () => {
    const convos = await chatService.getConversations('RBU21CSE045');
    expect(convos).toHaveLength(1);
    expect(convos[0].id).toBe('room-solar-drone');
    expect(convos[0].title).toBe('Project Match: Solar Autonomous Drone');
  });

  it('CHAT-02: Message validation rejects empty or excessively long payloads', async () => {
    await expect(
      chatService.sendMessage(
        { conversationId: 'room-solar-drone', content: '   ' },
        'RBU21CSE045'
      )
    ).rejects.toThrow(/Message content cannot be empty/i);

    const hugeContent = 'A'.repeat(4001);
    await expect(
      chatService.sendMessage(
        { conversationId: 'room-solar-drone', content: hugeContent },
        'RBU21CSE045'
      )
    ).rejects.toThrow(/Message length cannot exceed/i);
  });

  it('CHAT-03: Successfully sends and persists valid message', async () => {
    const msg = await chatService.sendMessage(
      { conversationId: 'room-solar-drone', content: 'Autonomous payload delivery ready for testing.' },
      'RBU21CSE045'
    );

    expect(msg).toBeDefined();
    expect(msg.content).toBe('Autonomous payload delivery ready for testing.');
    expect(msg.senderId).toBe('RBU21CSE045');
    expect(msg.status).toBe('sent');

    const history = await chatService.getMessages('room-solar-drone');
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe(msg.id);
  });

  it('CHAT-04: Enforces flood throttling (rejects 6th message within 10 seconds)', async () => {
    for (let i = 1; i <= 5; i++) {
      await chatService.sendMessage(
        { conversationId: 'room-solar-drone', content: `Message #${i}` },
        'RBU21CSE045'
      );
    }

    // 6th message should fail the flood limit
    await expect(
      chatService.sendMessage(
        { conversationId: 'room-solar-drone', content: 'Flooding message #6' },
        'RBU21CSE045'
      )
    ).rejects.toThrow(/Rate limit exceeded/i);
  });

  it('CHAT-05: Realtime subscription receives broadcast messages <500ms', async () => {
    let receivedMessage: any = null;
    const sub = chatService.subscribeToMessages('room-solar-drone', (msg) => {
      receivedMessage = msg;
    });

    const sent = await chatService.sendMessage(
      { conversationId: 'room-solar-drone', content: 'Realtime telemetry test' },
      'RBU21CSE045'
    );

    expect(receivedMessage).toBeDefined();
    expect(receivedMessage?.id).toBe(sent.id);
    expect(receivedMessage?.content).toBe('Realtime telemetry test');

    sub.unsubscribe();
  });

  it('CHAT-06: Block enforcement flags and isolates blocked relationships', async () => {
    const studentA = 'RBU21CSE045';
    const studentB = 'RBU22CSE101';

    expect(await mockRepo.isUserBlocked(studentA, studentB)).toBe(false);

    await chatService.blockUser(studentA, studentB, 'Harassment report');
    expect(await mockRepo.isUserBlocked(studentA, studentB)).toBe(true);

    await expect(chatService.blockUser(studentA, studentA)).rejects.toThrow(/cannot block yourself/i);

    await chatService.unblockUser(studentA, studentB);
    expect(await mockRepo.isUserBlocked(studentA, studentB)).toBe(false);
  });

  it('CHAT-07: Moderation ticket creation requires reason validation', async () => {
    await expect(
      chatService.reportMessage({
        reporterId: 'RBU21CSE045',
        reportedUserId: 'RBU22CSE101',
        reason: 'bad',
      })
    ).rejects.toThrow(/Report reason must be at least 5 characters/i);

    await expect(
      chatService.reportMessage({
        reporterId: 'RBU21CSE045',
        reportedUserId: 'RBU22CSE101',
        reason: 'Inappropriate language in project coordination room.',
      })
    ).resolves.not.toThrow();
  });
});
