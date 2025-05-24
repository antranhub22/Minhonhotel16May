import React, { useEffect, useRef, useState } from 'react';
import { useCallPopup } from '@/context/CallPopupContext';
import { t, Lang } from '@/i18n';

interface Transcript {
  id: string;
  callId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string | Date;
}

export const RealtimeConversation: React.FC = () => {
  const { currentCallId } = useCallPopup();
  const [conversation, setConversation] = useState<Transcript[]>([]);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>('en');

  // Lấy ngôn ngữ từ localStorage hoặc context nếu cần
  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Lang;
    if (storedLang) setLang(storedLang);
  }, []);

  useEffect(() => {
    if (!currentCallId) return;
    // Fetch initial transcript
    fetch(`/api/transcripts/${currentCallId}`)
      .then(res => res.json())
      .then(data => setConversation(Array.isArray(data) ? data : []));

    // Listen WebSocket for realtime transcript (nếu backend hỗ trợ)
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`wss://${window.location.host}/ws/transcripts/${currentCallId}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'transcript' && data.callId === currentCallId) {
          setConversation(prev => [...prev, data]);
        }
      };
    } catch {}
    return () => {
      if (ws) ws.close();
    };
  }, [currentCallId]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-96 overflow-y-auto" ref={conversationRef}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{t('realtimeConversation', lang)}</h2>
        {/* Có thể thêm trạng thái kết nối WebSocket nếu muốn */}
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