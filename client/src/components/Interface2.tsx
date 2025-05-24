import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import Reference from './Reference';
import SiriCallButton from './SiriCallButton';
import { referenceService, ReferenceItem } from '@/services/ReferenceService';
import InfographicSteps from './InfographicSteps';
import { t, Lang } from '@/i18n';
import { Button } from './ui/button';

interface Interface2Props {
  isActive: boolean;
}

// Interface cho trạng thái hiển thị của mỗi message
interface VisibleCharState {
  [messageId: string]: number;
}

// Interface cho một turn trong cuộc hội thoại
interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  messages: Array<{
    id: string;
    content: string;
    timestamp: Date;
  }>;
}

const Interface2: React.FC<Interface2Props> = ({ isActive }) => {
  const { 
    transcripts, 
    callDetails,
    callDuration,
    endCall: contextEndCall,
    isMuted,
    toggleMute,
    setCurrentInterface,
    micLevel,
    modelOutput,
    language
  } = useAssistant();
  
  // Cast language to Lang type
  const lang = language as Lang;
  
  // State cho Paint-on effect
  const [visibleChars, setVisibleChars] = useState<VisibleCharState>({});
  const animationFrames = useRef<{[key: string]: number}>({});
  
  // State để lưu trữ các turns đã được xử lý
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);
  
  // Add state for references
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  
  // Local duration state for backup timer functionality
  const [localDuration, setLocalDuration] = useState(0);
  
  const conversationRef = useRef<HTMLDivElement>(null);

  // NEW: State để ẩn/hiện khung realtime conversation
  const [showRealtimeConversation, setShowRealtimeConversation] = useState(true);
  
  // Cleanup function for animations
  const cleanupAnimations = () => {
    Object.values(animationFrames.current).forEach(frameId => {
      cancelAnimationFrame(frameId);
    });
    animationFrames.current = {};
  };
  
  // Load all references on mount
  useEffect(() => {
    async function loadAllReferences() {
      await referenceService.initialize();
      // Lấy toàn bộ referenceMap
      const allRefs = Object.values((referenceService as any).referenceMap || {}) as ReferenceItem[];
      console.log('All references loaded:', allRefs);
      setReferences(allRefs);
    }
    loadAllReferences();
  }, []);
  
  // Process transcripts into conversation turns
  useEffect(() => {
    const sortedTranscripts = [...transcripts].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    const turns: ConversationTurn[] = [];
    let currentTurn: ConversationTurn | null = null;

    sortedTranscripts.forEach((message) => {
      if (message.role === 'user') {
        // Always create a new turn for user messages
        currentTurn = {
          id: message.id.toString(),
          role: 'user',
          timestamp: message.timestamp,
          messages: [{ 
            id: message.id.toString(), 
            content: message.content,
            timestamp: message.timestamp 
          }]
        };
        turns.push(currentTurn);
      } else {
        // For assistant messages
        if (!currentTurn || currentTurn.role === 'user') {
          // Start new assistant turn
          currentTurn = {
            id: message.id.toString(),
            role: 'assistant',
            timestamp: message.timestamp,
            messages: []
          };
          turns.push(currentTurn);
        }
        // Add message to current assistant turn
        currentTurn.messages.push({
          id: message.id.toString(),
          content: message.content,
          timestamp: message.timestamp
        });
      }
    });

    setConversationTurns(turns);
  }, [transcripts]);

  // Paint-on animation effect
  useEffect(() => {
    // Get all assistant messages from all turns
    const assistantMessages = conversationTurns
      .filter(turn => turn.role === 'assistant')
      .flatMap(turn => turn.messages);
    
    assistantMessages.forEach(message => {
      // Skip if already animated
      if (visibleChars[message.id] === message.content.length) return;
      
      let currentChar = visibleChars[message.id] || 0;
      const content = message.content;
      
      const animate = () => {
        if (currentChar < content.length) {
          setVisibleChars(prev => ({
            ...prev,
            [message.id]: currentChar + 1
          }));
          currentChar++;
          animationFrames.current[message.id] = requestAnimationFrame(animate);
        } else {
          delete animationFrames.current[message.id];
        }
      };
      
      animationFrames.current[message.id] = requestAnimationFrame(animate);
    });
    
    // Cleanup on unmount or when turns change
    return () => cleanupAnimations();
  }, [conversationTurns]);

  // Handler for Cancel button - End call and go back to interface1
  const handleCancel = useCallback(() => {
    // Capture the current duration for the email
    const finalDuration = callDuration > 0 ? callDuration : localDuration;
    console.log('Canceling call with duration:', finalDuration);
    
    // Call the context's endCall and switch to interface1
    contextEndCall();
    setCurrentInterface('interface1');
  }, [callDuration, localDuration, contextEndCall, setCurrentInterface]);

  // Handler for Next button - End call and proceed to interface3
  const handleNext = useCallback(() => {
    // Nếu chưa có hội thoại thì không cho xác nhận
    if (!transcripts || transcripts.length === 0) {
      alert(t('need_conversation', language));
      return;
    }
    // Capture the current duration for the email
    const finalDuration = callDuration > 0 ? callDuration : localDuration;
    console.log('Ending call with duration:', finalDuration);
    // Call the context's endCall and switch to interface3, interface3fr (French), hoặc interface3vi (Vietnamese)
    contextEndCall();
    if (language === 'fr') {
      setCurrentInterface('interface3fr');
    } else if (language === 'vi') {
      setCurrentInterface('interface3vi');
    } else {
      setCurrentInterface('interface3');
    }
  }, [callDuration, localDuration, contextEndCall, setCurrentInterface, transcripts, language]);
  
  // Format duration for display
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };
  
  // Local timer as a backup to ensure we always have a working timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // Only start the timer when this interface is active
    if (isActive) {
      console.log('Interface2 is active, starting local timer');
      // Initialize with the current duration from context
      setLocalDuration(callDuration || 0);
      
      // Start the local timer
      timer = setInterval(() => {
        setLocalDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) {
        console.log('Cleaning up local timer in Interface2');
        clearInterval(timer);
      }
    };
  }, [isActive, callDuration]);
  
  // Auto scroll to top when new transcript arrives
  useEffect(() => {
    if (conversationRef.current && isActive) {
      conversationRef.current.scrollTop = 0;
    }
  }, [conversationTurns, isActive]);
  
  return (
    <div 
      className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } z-20 overflow-y-auto`} id="interface2"
      style={{
        backgroundImage: `linear-gradient(rgba(139,26,71,0.7), rgba(168,34,85,0.6)), url('/assets/courtyard.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto flex flex-col md:flex-row p-2 h-full gap-2">
        {/* Left: Call indicator & Realtime conversation side by side, Reference below */}
        <div className="w-full md:w-3/4 lg:w-2/3 flex flex-col items-center space-y-1 sm:space-y-4 mt-1 min-h-0 overflow-y-auto">
          {/* Replace old orb with new SiriCallButton */}
          <div className="relative flex flex-col items-center justify-center mb-1 sm:mb-6 w-full max-w-xs mx-auto">
            {/* SiriCallButton ở trên */}
            <SiriCallButton
              containerId="siri-button"
              isListening={!isMuted}
              volumeLevel={micLevel}
            />
            {/* Duration bar với các nút hai bên, căn giữa tuyệt đối */}
            <div className="flex items-center justify-center mt-2 w-full gap-2 sm:gap-3">
              {/* Nút Mute bên trái */}
              <button
                className="flex items-center justify-center transition-colors"
                title={isMuted ? t('unmute', language) : t('mute', language)}
                onClick={toggleMute}
                style={{fontSize: 22, padding: 0, background: 'none', border: 'none', color: '#d4af37', width: 28, height: 28}}
                onMouseOver={e => (e.currentTarget.style.color = '#ffd700')}
                onMouseOut={e => (e.currentTarget.style.color = '#d4af37')}
              >
                <span className="material-icons">{isMuted ? 'mic_off' : 'mic'}</span>
              </button>
              {/* Nút Cancel (chỉ mobile) */}
              <button
                id="cancelButton"
                onClick={handleCancel}
                className="flex items-center justify-center px-3 py-2 bg-white/80 hover:bg-blue-100 text-blue-900 rounded-full text-xs font-semibold border-2 border-blue-200 shadow transition-colors sm:hidden active:scale-95 active:bg-blue-100"
                style={{
                  fontFamily: 'inherit',
                  letterSpacing: 0.2,
                  minHeight: 44,
                  minWidth: 90,
                  fontSize: 14,
                  touchAction: 'manipulation',
                  zIndex: 10
                }}
              >
                <span className="material-icons text-base mr-1">cancel</span>{t('cancel', language)}
              </button>
              {/* Duration ở giữa, luôn căn giữa */}
              <div className="flex-1 flex justify-center">
                <div className="text-white text-xs sm:text-sm bg-blue-900/80 rounded-full px-3 sm:px-4 py-1 shadow-lg border border-white/30 flex items-center justify-center" style={{backdropFilter:'blur(2px)'}}>
                  {formatDuration(localDuration)}
                </div>
              </div>
              {/* Nút xác nhận (mobile) */}
              <Button
                id="confirmButton"
                onClick={handleNext}
                variant="yellow"
                className="flex items-center justify-center sm:hidden text-xs font-bold"
                style={{ minHeight: 44, minWidth: 120, fontSize: 14, zIndex: 10 }}
              >
                <span className="material-icons text-lg mr-2">send</span>{t('confirm', language)}
              </Button>
              {/* Nút MicLevel bên phải */}
              <button
                className="flex items-center justify-center transition-colors"
                title="Mic Level"
                style={{fontSize: 22, padding: 0, background: 'none', border: 'none', color: '#d4af37', width: 28, height: 28}}
                tabIndex={-1}
                disabled
                onMouseOver={e => (e.currentTarget.style.color = '#ffd700')}
                onMouseOut={e => (e.currentTarget.style.color = '#d4af37')}
              >
                <span className="material-icons">graphic_eq</span>
                <span className="ml-1 flex items-end h-4 w-6">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      width: 2,
                      height: `${4 + Math.round((micLevel/100)*12) * ((i%2)+1)}px`,
                      background: '#d4af37',
                      marginLeft: 1,
                      borderRadius: 1
                    }} />
                  ))}
                </span>
              </button>
            </div>
          </div>
          
          {/* Conversation Section */}
          <div className="conversation-section bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{t('conversation', lang)}</h2>
              <button
                onClick={() => setShowRealtimeConversation(!showRealtimeConversation)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                {showRealtimeConversation ? t('hide', lang) : t('show', lang)}
              </button>
            </div>

            {showRealtimeConversation && (
              <div className="space-y-4">
                {conversationTurns.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">{t('noConversation', lang)}</p>
                  </div>
                ) : (
                  conversationTurns.map((turn) => (
                    <div
                      key={turn.id}
                      className={`p-4 rounded-lg ${
                        turn.role === 'user' ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          turn.role === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          {turn.role === 'user' ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-1">
                            {turn.role === 'user' ? t('you', lang) : t('assistant', lang)}
                          </div>
                          <div className="text-gray-800">
                            {turn.messages.map((message) => (
                              <div key={message.id} className="mb-2">
                                {visibleChars[message.id] !== undefined
                                  ? message.content.slice(0, visibleChars[message.id])
                                  : message.content}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {turn.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {/* Right: Control buttons */}
        <div className="w-1/4 lg:w-1/3 flex-col items-center lg:items-end p-2 space-y-4 overflow-auto hidden sm:flex" style={{ maxHeight: '100%' }}>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            {/* Nút xác nhận (desktop/tablet) */}
            <Button
              id="endCallButton"
              onClick={handleNext}
              variant="yellow"
              className="w-full md:w-auto flex items-center justify-center space-x-2 text-base sm:text-lg"
              style={{ minHeight: 56, minWidth: 220, zIndex: 10 }}
            >
              <span className="material-icons">send</span>
              <span className="whitespace-nowrap">{t('confirm_request', language)}</span>
            </Button>
            <button
              id="cancelButtonDesktop"
              onClick={handleCancel}
              className="w-full md:w-auto bg-white hover:bg-blue-100 text-blue-900 font-semibold py-3 px-8 rounded-full shadow flex items-center justify-center space-x-2 transition-all duration-200 border-2 border-blue-200 text-base sm:text-lg active:scale-95 active:bg-blue-100"
              style={{
                fontFamily: 'inherit',
                letterSpacing: 0.2,
                minHeight: 56,
                minWidth: 120,
                touchAction: 'manipulation',
                zIndex: 10
              }}
            >
              <span className="material-icons text-lg mr-2">cancel</span>{t('cancel', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interface2;
