import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface ActiveCall {
  id: string;
  roomNumber: string;
  startTime: string;
  duration: string;
  status: 'active' | 'onHold' | 'transferring';
  agent: string;
  customer: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

export const CallMonitoring: React.FC = () => {
  const { language } = useAssistant();
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<ActiveCall | null>(null);

  useEffect(() => {
    fetchActiveCalls();
    const interval = setInterval(fetchActiveCalls, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveCalls = async () => {
    try {
      const response = await axios.get('/api/calls/active');
      setActiveCalls(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch active calls');
      setLoading(false);
    }
  };

  const handleIntervene = async (callId: string) => {
    try {
      await axios.post(`/api/calls/${callId}/intervene`);
      // Refresh calls after intervention
      fetchActiveCalls();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to intervene in call');
    }
  };

  const handleTransfer = async (callId: string) => {
    try {
      await axios.post(`/api/calls/${callId}/transfer`);
      // Refresh calls after transfer
      fetchActiveCalls();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to transfer call');
    }
  };

  const getStatusColor = (status: ActiveCall['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'onHold':
        return 'bg-yellow-100 text-yellow-800';
      case 'transferring':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: ActiveCall['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'neutral':
        return 'text-gray-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
            {t('callMonitoring', language as Lang)}
          </h1>
          <Button onClick={fetchActiveCalls}>
            {t('refresh', language as Lang)}
          </Button>
        </div>

        {/* Active Calls Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeCalls.map((call) => (
            <Card
              key={call.id}
              className={`p-6 cursor-pointer transition-colors ${
                selectedCall?.id === call.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => setSelectedCall(call)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">
                    {t('room', language as Lang)} {call.roomNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t('agent', language as Lang)}: {call.agent}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                    call.status
                  )}`}
                >
                  {t(call.status, language as Lang)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">{t('customer', language as Lang)}:</span>{' '}
                  {call.customer}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('duration', language as Lang)}:</span>{' '}
                  {call.duration}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('startTime', language as Lang)}:</span>{' '}
                  {new Date(call.startTime).toLocaleString()}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm">
                  <span className="font-medium">{t('sentiment', language as Lang)}:</span>{' '}
                  <span className={getSentimentColor(call.sentiment)}>
                    {t(call.sentiment, language as Lang)}
                  </span>
                </p>
              </div>

              {call.keywords.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">
                    {t('keywords', language as Lang)}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {call.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIntervene(call.id);
                  }}
                >
                  {t('intervene', language as Lang)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTransfer(call.id);
                  }}
                >
                  {t('transfer', language as Lang)}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {activeCalls.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('noActiveCalls', language as Lang)}
          </div>
        )}
      </div>
    </div>
  );
}; 