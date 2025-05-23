import { useState, useEffect, useCallback, useRef } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { ActiveOrder, AssistantContextType } from '@/types';

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const assistant = useAssistant() as AssistantContextType;
  const retryRef = useRef(0);

  // Initialize WebSocket connection
  const initWebSocket = useCallback(() => {
    console.log('useWebSocket env VITE_API_HOST:', import.meta.env.VITE_API_HOST);
    if (socket !== null) {
      socket.close();
    }

    // Always connect WebSocket to the current application origin
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log('Attempting WebSocket connection to', wsUrl);
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
      retryRef.current = 0; // reset retry count
      
      // Send initial message with call ID if available
      if (assistant.callDetails) {
        newSocket.send(JSON.stringify({
          type: 'init',
          callId: assistant.callDetails.id
        }));
      }
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Debug log cho mọi message
        console.log('[WebSocket] Received message:', data);
        // Handle transcript messages
        if (data.type === 'transcript') {
          assistant.addTranscript({
            callId: data.callId,
            role: data.role,
            content: data.content
          });
        }
        // Handle order status update (realtime from staff UI)
        if (data.type === 'order_status_update' && (data.orderId || data.reference) && data.status) {
          // Chuẩn hóa reference để so sánh (bỏ #ORD-, lowercase, trim)
          const normalizeRef = (ref: string) => (ref || '').replace(/^#?ord[-_]?/i, '').toLowerCase().trim();
          const wsRef = data.reference ? normalizeRef(data.reference) : (data.orderId ? normalizeRef(data.orderId) : '');
          console.log('[WebSocket] Received order_status_update:', { 
            rawReference: data.reference, 
            rawOrderId: data.orderId, 
            status: data.status, 
            normalizedRef: wsRef 
          });
          assistant.setActiveOrders((prevOrders: ActiveOrder[]) => {
            console.log('[WebSocket] ActiveOrders before update:', prevOrders.map(o => ({
              reference: o.reference,
              normalizedRef: normalizeRef(o.reference),
              status: o.status
            })));
            const updated = prevOrders.map((order: ActiveOrder) => {
              const orderRefNorm = normalizeRef(order.reference);
              const matchByReference = wsRef && orderRefNorm === wsRef;
              if (matchByReference) {
                console.log('[WebSocket] Found matching order:', {
                  originalRef: order.reference,
                  normalizedRef: orderRefNorm,
                  newStatus: data.status
                });
                return { ...order, status: data.status };
              }
              return order;
            });
            console.log('[WebSocket] ActiveOrders after update:', updated.map(o => ({
              reference: o.reference,
              normalizedRef: normalizeRef(o.reference),
              status: o.status
            })));
            return updated;
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    newSocket.onclose = (event) => {
      console.log('WebSocket connection closed', event);
      setConnected(false);
      
      // Reconnect with exponential backoff
      if (retryRef.current < 5) {
        const delay = Math.pow(2, retryRef.current) * 1000;
        console.log(`Reconnecting WebSocket in ${delay}ms (attempt ${retryRef.current + 1})`);
        setTimeout(initWebSocket, delay);
        retryRef.current++;
      } else {
        console.warn('Max WebSocket reconnection attempts reached');
      }
    };
    
    newSocket.onerror = (event) => {
      console.error('WebSocket encountered error', event);
      // Close socket to trigger reconnect logic
      if (newSocket.readyState !== WebSocket.CLOSED) {
        newSocket.close();
      }
    };
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [assistant.callDetails, assistant.addTranscript, assistant.activeOrders, assistant.setActiveOrders]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (socket && connected) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message, WebSocket not connected');
    }
  }, [socket, connected]);

  // Reconnect function
  const reconnect = useCallback(() => {
    if (!connected) {
      initWebSocket();
    }
  }, [connected, initWebSocket]);

  // Initialize WebSocket on mount
  useEffect(() => {
    initWebSocket();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Re-send init if callDetails.id becomes available after socket is open
  useEffect(() => {
    if (socket && connected && assistant.callDetails?.id) {
      console.log('Sending init message with callId after availability', assistant.callDetails.id);
      socket.send(JSON.stringify({
        type: 'init',
        callId: assistant.callDetails.id
      }));
    }
  }, [assistant.callDetails?.id, socket, connected]);

  return { connected, sendMessage, reconnect };
}
