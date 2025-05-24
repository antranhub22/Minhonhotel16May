import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RealtimeConversation } from '@/components/RealtimeConversation';
import { CallSummaryBox } from '@/components/CallSummaryBox';
import { useAssistant } from './AssistantContext';
import { t, Lang } from '@/i18n';

interface CallPopupContextType {
  showRealtimePopup: (callId: string) => void;
  showSummaryPopup: (callId: string) => void;
  hideRealtimePopup: () => void;
  hideSummaryPopup: () => void;
}

const CallPopupContext = createContext<CallPopupContextType | undefined>(undefined);

export const CallPopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [realtimePopupVisible, setRealtimePopupVisible] = useState(false);
  const [summaryPopupVisible, setSummaryPopupVisible] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>('');
  const { language } = useAssistant();
  const lang = language as Lang;

  const showRealtimePopup = (callId: string) => {
    setCurrentCallId(callId);
    setRealtimePopupVisible(true);
  };

  const showSummaryPopup = (callId: string) => {
    setCurrentCallId(callId);
    setSummaryPopupVisible(true);
  };

  const hideRealtimePopup = () => {
    setRealtimePopupVisible(false);
  };

  const hideSummaryPopup = () => {
    setSummaryPopupVisible(false);
  };

  return (
    <CallPopupContext.Provider value={{
      showRealtimePopup,
      showSummaryPopup,
      hideRealtimePopup,
      hideSummaryPopup,
    }}>
      {children}

      {/* Realtime Conversation Popup */}
      {realtimePopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">{t('liveConversation', lang)}</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={hideRealtimePopup}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {t('confirm', lang)}
                </button>
                <button 
                  onClick={hideRealtimePopup}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-64px)]">
              {currentCallId && <RealtimeConversation callId={currentCallId} />}
            </div>
          </div>
        </div>
      )}

      {/* Call Summary Popup */}
      {summaryPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">{t('callSummary', lang)}</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={hideSummaryPopup}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {t('confirm', lang)}
                </button>
                <button 
                  onClick={hideSummaryPopup}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-64px)]">
              {currentCallId && <CallSummaryBox callId={currentCallId} />}
            </div>
          </div>
        </div>
      )}
    </CallPopupContext.Provider>
  );
};

export const useCallPopup = () => {
  const context = useContext(CallPopupContext);
  if (context === undefined) {
    throw new Error('useCallPopup must be used within a CallPopupProvider');
  }
  return context;
}; 