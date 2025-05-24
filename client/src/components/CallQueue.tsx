import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface QueuedCall {
  id: string;
  roomNumber: string;
  customer: string;
  waitTime: string;
  priority: number;
  category: string;
  notes?: string;
}

export const CallQueue: React.FC = () => {
  const { language } = useAssistant();
  const [queuedCalls, setQueuedCalls] = useState<QueuedCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueuedCalls();
    const interval = setInterval(fetchQueuedCalls, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueuedCalls = async () => {
    try {
      const response = await axios.get('/api/queue');
      setQueuedCalls(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch queued calls');
      setLoading(false);
    }
  };

  const handleAnswer = async (callId: string) => {
    try {
      await axios.post(`/api/queue/${callId}/answer`);
      fetchQueuedCalls();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to answer call');
    }
  };

  const handleTransfer = async (callId: string) => {
    try {
      await axios.post(`/api/queue/${callId}/transfer`);
      fetchQueuedCalls();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to transfer call');
    }
  };

  const handleCancel = async (callId: string) => {
    try {
      await axios.post(`/api/queue/${callId}/cancel`);
      fetchQueuedCalls();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel call');
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 3:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-red-500 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('callQueue', language as Lang)}
          </h1>
          <Button onClick={fetchQueuedCalls}>
            {t('refresh', language as Lang)}
          </Button>
        </div>

        {/* Queue Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">
              {t('totalQueued', language as Lang)}
            </h3>
            <p className="text-3xl font-bold">{queuedCalls.length}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">
              {t('averageWaitTime', language as Lang)}
            </h3>
            <p className="text-3xl font-bold">
              {queuedCalls.length > 0
                ? queuedCalls.reduce(
                    (acc, call) => acc + parseInt(call.waitTime),
                    0
                  ) / queuedCalls.length
                : 0}{' '}
              {t('minutes', language as Lang)}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">
              {t('highestPriority', language as Lang)}
            </h3>
            <p className="text-3xl font-bold">
              {queuedCalls.length > 0
                ? Math.min(...queuedCalls.map((call) => call.priority))
                : 0}
            </p>
          </Card>
        </div>

        {/* Queue List */}
        <div className="space-y-4">
          {queuedCalls.map((call) => (
            <Card key={call.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium">
                      {t('room', language as Lang)} {call.roomNumber}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(
                        call.priority
                      )}`}
                    >
                      {t('priority', language as Lang)} {call.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('customer', language as Lang)}: {call.customer}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('waitTime', language as Lang)}: {call.waitTime}{' '}
                    {t('minutes', language as Lang)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('category', language as Lang)}: {call.category}
                  </p>
                  {call.notes && (
                    <p className="text-sm text-gray-500 mt-2">{call.notes}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnswer(call.id)}
                  >
                    {t('answer', language as Lang)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTransfer(call.id)}
                  >
                    {t('transfer', language as Lang)}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(call.id)}
                  >
                    {t('cancel', language as Lang)}
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {queuedCalls.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('noQueuedCalls', language as Lang)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 