import { useCallPopup } from '@/context/CallPopupContext';

export const VapiSDK: React.FC = () => {
  const { showRealtimePopup, showSummaryPopup } = useCallPopup();
  
  const handleCallStart = (callId: string) => {
    // Show realtime conversation popup when call starts
    showRealtimePopup(callId);
  };

  const handleCallEnd = (callId: string) => {
    // Show summary popup when call ends
    showSummaryPopup(callId);
  };

  // ... rest of the component ...
}; 