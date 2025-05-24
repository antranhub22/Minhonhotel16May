import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface CallSummary {
  id: number;
  callId: string;
  content: string;
  timestamp: string;
  roomNumber: string;
  duration: string;
  orderReference?: string;
}

export const CallSummary: React.FC = () => {
  const { language } = useAssistant();
  const [summaries, setSummaries] = useState<CallSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/summaries');
      setSummaries(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch call summaries');
    } finally {
      setLoading(false);
    }
  };

  const filteredSummaries = summaries.filter(summary => 
    summary.roomNumber.includes(searchTerm) ||
    summary.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('callSummaries', language as Lang)}
          </h1>
          <div className="flex space-x-4">
            <Input
              type="text"
              placeholder={t('searchSummaries', language as Lang)}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button onClick={fetchSummaries}>
              {t('refresh', language as Lang)}
            </Button>
          </div>
        </div>

        {/* Summaries List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : filteredSummaries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('noSummaries', language as Lang)}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSummaries.map((summary) => (
              <Card key={summary.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {t('room', language as Lang)} {summary.roomNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(summary.timestamp)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('duration', language as Lang)}: {summary.duration}
                  </div>
                </div>

                <div className="prose max-w-none mb-4">
                  {summary.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {summary.orderReference && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">
                      {t('orderReference', language as Lang)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {summary.orderReference}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    {t('viewTranscript', language as Lang)}
                  </Button>
                  <Button variant="outline" size="sm">
                    {t('export', language as Lang)}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 