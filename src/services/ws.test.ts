import { connectWebSocket, sendChatMessage, subscribeToChat, disconnectWebSocket, ChatMessage } from './ws';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

jest.mock('sockjs-client');
jest.mock('@stomp/stompjs', () => {
  const actual = jest.requireActual('@stomp/stompjs');
  return {
    ...actual,
    Stomp: {
      over: jest.fn(() => mockStompClient)
    }
  };
});

const mockStompClient = {
  connect: jest.fn(),
  send: jest.fn(),
  subscribe: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
};

describe('WebSocket Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStompClient.connected = true;
  });

  test('connectWebSocket calls stompClient.connect', () => {
    const onConnect = jest.fn();
    connectWebSocket('user1', onConnect);
    expect(mockStompClient.connect).toHaveBeenCalled();
  });

  test('sendChatMessage sends message if connected', () => {
    const message: ChatMessage = { senderId: 'user1', content: 'Hello', chatId: 'chat1' };
    sendChatMessage(message);
    expect(mockStompClient.send).toHaveBeenCalledWith(
      '/app/chat.sendMessage',
      {},
      JSON.stringify(message)
    );
  });

  test('subscribeToChat subscribes to correct destination for group', () => {
    const onMessage = jest.fn();
    subscribeToChat('chat1', onMessage, true);
    expect(mockStompClient.subscribe).toHaveBeenCalledWith(
      '/topic/chat/chat1',
      expect.any(Function)
    );
  });

  test('subscribeToChat subscribes to correct destination for private', () => {
    const onMessage = jest.fn();
    subscribeToChat('chat1', onMessage, false);
    expect(mockStompClient.subscribe).toHaveBeenCalledWith(
      '/user/queue/messages',
      expect.any(Function)
    );
  });

  test('disconnectWebSocket calls stompClient.disconnect', () => {
    disconnectWebSocket();
    expect(mockStompClient.disconnect).toHaveBeenCalled();
  });
});
