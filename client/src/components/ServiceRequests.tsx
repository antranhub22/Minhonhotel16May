import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface ServiceRequest {
  id: number;
  roomNumber: string;
  guestName: string;
  requestContent: string;
  status: string;
  createdAt: string;
  notes: string;
}

export const ServiceRequests: React.FC = () => {
  const { language } = useAssistant();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: 'all',
    roomNumber: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/service-requests', {
        params: filter
      });
      setRequests(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      await axios.patch(`/api/service-requests/${requestId}/status`, {
        status: newStatus
      });
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddNote = async (requestId: number, note: string) => {
    try {
      await axios.post(`/api/service-requests/${requestId}/notes`, {
        note
      });
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('serviceRequests', language as Lang)}
          </h1>
          <Button>
            {t('newRequest', language as Lang)}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <Select
            value={filter.status}
            onValueChange={(value) => setFilter({ ...filter, status: value })}
            className="w-48"
          >
            <option value="all">{t('allStatus', language as Lang)}</option>
            <option value="pending">{t('pending', language as Lang)}</option>
            <option value="in_progress">{t('inProgress', language as Lang)}</option>
            <option value="completed">{t('completed', language as Lang)}</option>
          </Select>
          <Input
            type="text"
            placeholder={t('searchByRoom', language as Lang)}
            value={filter.roomNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter({ ...filter, roomNumber: e.target.value })}
            className="w-48"
          />
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {t('room', language as Lang)} {request.roomNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {request.guestName}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t(request.status, language as Lang)}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{request.requestContent}</p>

                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(request.id, 'in_progress')}
                      disabled={request.status === 'in_progress'}
                    >
                      {t('start', language as Lang)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(request.id, 'completed')}
                      disabled={request.status === 'completed'}
                    >
                      {t('complete', language as Lang)}
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">
                      {t('notes', language as Lang)}
                    </h4>
                    <div className="space-y-2">
                      {request.notes && (
                        <p className="text-sm text-gray-600">{request.notes}</p>
                      )}
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          placeholder={t('addNote', language as Lang)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddNote(request.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 