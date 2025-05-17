export interface Call {
  id: string;
  callerName: string;
  phoneNumber: string;
  callType: 'incoming' | 'outgoing';
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
  duration: string;
  startTime: string;
  endTime: string;
  notes: string;
  recordingUrl: string;
  agentId: string;
  agentName: string;
}

export const mockCallData: Call = {
  id: '1',
  callerName: 'Alice Brown',
  phoneNumber: '+84 123 456 792',
  callType: 'incoming',
  status: 'completed',
  duration: '5:30',
  startTime: '2024-01-01T10:00:00Z',
  endTime: '2024-01-01T10:05:30Z',
  notes: 'Customer inquired about room availability',
  recordingUrl: '/recordings/call-1.mp3',
  agentId: '1',
  agentName: 'John Doe'
}; 