declare module '@/context/AssistantContext' {
  export interface AssistantContextType {
    currentInterface: string;
    setCurrentInterface: (layer: string) => void;
    transcripts: Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      timestamp: Date;
      isModelOutput?: boolean;
    }>;
    setTranscripts: (transcripts: any[]) => void;
    addTranscript: (transcript: any) => void;
    orderSummary: any;
    setOrderSummary: (summary: any) => void;
    callDetails: any;
    setCallDetails: (details: any) => void;
    order: any;
    setOrder: (order: any) => void;
    callDuration: number;
    setCallDuration: (duration: number) => void;
    isMuted: boolean;
    toggleMute: () => void;
    startCall: () => Promise<void>;
    endCall: () => void;
    callSummary: any;
    setCallSummary: (summary: any) => void;
    serviceRequests: any[];
    setServiceRequests: (requests: any[]) => void;
    vietnameseSummary: string | null;
    setVietnameseSummary: (summary: string) => void;
    translateToVietnamese: (text: string) => Promise<string>;
    emailSentForCurrentSession: boolean;
    setEmailSentForCurrentSession: (sent: boolean) => void;
    requestReceivedAt: Date | null;
    setRequestReceivedAt: (date: Date | null) => void;
    activeOrders: any[];
    addActiveOrder: (order: any) => void;
    setActiveOrders: (orders: any[]) => void;
    micLevel: number;
    modelOutput: string[];
    setModelOutput: (output: string[]) => void;
    addModelOutput: (output: string) => void;
    language: string;
    setLanguage: (lang: string) => void;
  }

  export function useAssistant(): AssistantContextType;
}

declare module '@/services/ReferenceService' {
  export interface ReferenceItem {
    url: string;
    title: string;
    description: string;
  }

  export const referenceService: {
    initialize: () => void;
    findReferences: (text: string) => ReferenceItem[];
  };
}

declare module '@/utils/dictionary' {
  export interface DictionaryEntry {
    keyword: string;
    fragments: string[];
    type: 'word' | 'phrase' | 'name';
  }

  export function findInDictionary(fragments: string[]): DictionaryEntry | null;
}

declare module './Reference' {
  import { ReferenceItem } from '@/services/ReferenceService';
  
  interface ReferenceProps {
    references: ReferenceItem[];
  }
  
  const Reference: React.FC<ReferenceProps>;
  export default Reference;
}

declare module './SiriCallButton' {
  interface SiriCallButtonProps {
    containerId: string;
    isListening: boolean;
    volumeLevel: number;
  }
  
  const SiriCallButton: React.FC<SiriCallButtonProps>;
  export default SiriCallButton;
}

// Khai báo type cho các component local
declare namespace Components {
  import { ReferenceItem } from '@/services/ReferenceService';
  
  export interface ReferenceProps {
    references: ReferenceItem[];
  }
  
  export interface SiriCallButtonProps {
    containerId: string;
    isListening: boolean;
    volumeLevel: number;
  }
} 