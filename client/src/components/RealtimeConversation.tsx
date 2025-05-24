import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAssistant } from '@/context/AssistantContext';
import { t, Lang } from '@/i18n';

interface Transcript {
  id: string;
  callId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const RealtimeConversation: React.FC = () => {
  const { language, callDetails, transcripts } = useAssistant();
  const { connected } = useWebSocket();
  const [conversation, setConversation] = useState<Transcript[]>([]);
  const conversationRef = useRef<HTMLDivElement>(null);
  const lang = language as Lang;

  useEffect(() => {
    setConversation(transcripts);
  }, [transcripts]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-96 overflow-y-auto" ref={conversationRef}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{t('realtimeConversation', lang)}</h2>
        <span className={`text-xs ${connected ? 'text-green-600' : 'text-red-500'}`}>{connected ? t('connected', lang) : t('disconnected', lang)}</span>
      </div>
      {conversation.length === 0 ? (
        <div className="text-gray-400 text-center py-8">{t('noConversation', lang)}</div>
      ) : (
        conversation.map((turn) => (
          <div key={turn.id} className={`mb-3 flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${turn.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
              <div className="text-xs text-gray-500 mb-1">
                {turn.role === 'assistant' ? t('assistant', lang) : t('guest', lang)} • {new Date(turn.timestamp).toLocaleTimeString()}
              </div>
              <div className="text-sm">{turn.content}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}; 