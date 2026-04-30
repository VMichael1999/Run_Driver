import { useState, useCallback } from 'react';
import type { ChatMessage } from '@shared/types';

const DUMMY_MESSAGES: ChatMessage[] = [
  { id: '1', text: 'Hola, ya voy para allá', timestamp: new Date(), isSentByMe: false, isRead: true },
  { id: '2', text: 'Ok, te espero en la puerta principal', timestamp: new Date(), isSentByMe: true, isRead: true },
];

interface UseChatReturn {
  messages: ChatMessage[];
  draft: string;
  setDraft: (text: string) => void;
  sendMessage: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(DUMMY_MESSAGES);
  const [draft, setDraft] = useState('');

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      isSentByMe: true,
      isRead: false,
    };
    setMessages((prev) => [...prev, msg]);
    setDraft('');
  }, [draft]);

  return { messages, draft, setDraft, sendMessage };
}
