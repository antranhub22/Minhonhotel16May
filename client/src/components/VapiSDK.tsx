import { useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { useCallPopup } from '@/context/CallPopupContext';

// Lấy public key và assistant id từ biến môi trường (đa ngôn ngữ nếu cần)
const getVapiConfig = (lang: string) => {
  if (lang === 'fr') {
    return {
      publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY_FR,
      assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID_FR,
    };
  } else if (lang === 'zh') {
    return {
      publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH,
      assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH,
    };
  } else if (lang === 'ru') {
    return {
      publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY_RU,
      assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID_RU,
    };
  } else if (lang === 'ko') {
    return {
      publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY_KO,
      assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID_KO,
    };
  }
  return {
    publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY,
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID,
  };
};

export const VapiSDK: React.FC<{ language?: string }> = ({ language = 'en' }) => {
  const { showRealtimePopup, showSummaryPopup } = useCallPopup();
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    const { publicKey } = getVapiConfig(language);
    if (!publicKey) return;
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', (call) => {
      if (call && call.id) showRealtimePopup(call.id);
    });
    vapi.on('call-end', (call) => {
      if (call && call.id) showSummaryPopup(call.id);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, [language, showRealtimePopup, showSummaryPopup]);

  return null;
}; 