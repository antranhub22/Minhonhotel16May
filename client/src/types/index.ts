export type Language = 'en' | 'fr' | 'zh';

export interface Transcript {
  id: number;
  callId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isModelOutput?: boolean;
}

export interface CallSummary {
  id: number;
  callId: string;
  content: string;
  timestamp: Date;
  roomNumber?: string;
  duration?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  serviceType?: string; // Type of service this item belongs to
}

export interface OrderSummary {
  orderType: string;
  deliveryTime: 'asap' | '30min' | '1hour' | 'specific';
  roomNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialInstructions: string;
  items: OrderItem[];
  totalAmount: number;
}

export interface ServiceRequest {
  serviceType: string; // Key from categories like 'room-service', 'tours-activities', etc.
  requestText: string; // Full text of request
  details: {
    date?: string;
    time?: string;
    location?: string;
    people?: number;
    amount?: string;
    roomNumber?: string;
    otherDetails?: string;
  }
}

export interface Order {
  reference: string;
  estimatedTime: string;
  summary: OrderSummary;
}

export interface CallDetails {
  id: string;
  roomNumber: string;
  duration: string;
  category: string;
}

export type InterfaceLayer = 'interface1' | 'interface2' | 'interface3' | 'interface3vi' | 'interface3fr' | 'interface4';

export interface AssistantContextType {
  currentInterface: InterfaceLayer;
  setCurrentInterface: (layer: InterfaceLayer) => void;
  transcripts: Transcript[];
  setTranscripts: (transcripts: Transcript[]) => void;
  addTranscript: (transcript: Omit<Transcript, 'id' | 'timestamp'>) => void;
  orderSummary: OrderSummary | null;
  setOrderSummary: (summary: OrderSummary) => void;
  callDetails: CallDetails | null;
  setCallDetails: (details: CallDetails) => void;
  order: Order | null;
  setOrder: (order: Order) => void;
  callDuration: number;
  setCallDuration: (duration: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  startCall: () => Promise<void>;
  endCall: () => void;
  callSummary: CallSummary | null;
  setCallSummary: (summary: CallSummary) => void;
  serviceRequests: ServiceRequest[];
  setServiceRequests: (requests: ServiceRequest[]) => void;
  vietnameseSummary: string | null;
  setVietnameseSummary: (summary: string) => void;
  translateToVietnamese: (text: string) => Promise<string>;
  emailSentForCurrentSession: boolean;
  setEmailSentForCurrentSession: (sent: boolean) => void;
  requestReceivedAt: Date | null;
  setRequestReceivedAt: (date: Date | null) => void;
  activeOrders: ActiveOrder[];
  addActiveOrder: (order: ActiveOrder) => void;
  setActiveOrders: React.Dispatch<React.SetStateAction<ActiveOrder[]>>;
  micLevel: number;
  modelOutput: string[];
  setModelOutput: (output: string[]) => void;
  addModelOutput: (output: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

// Represents an order item in the status panel
export interface ActiveOrder {
  reference: string;
  requestedAt: Date;
  estimatedTime: string;
  status?: string; // Thêm trường status để hiển thị trạng thái từ Staff UI
}
