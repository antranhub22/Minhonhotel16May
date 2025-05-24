import React, { useState, useEffect } from 'react';
import { useStaff } from '@/context/StaffContext';
import { useAssistant } from '@/context/AssistantContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface StaffMember {
  id: number;
  username: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export const StaffDashboard: React.FC = () => {
  const { staff, isAdmin, logout } = useStaff();
  const { language } = useAssistant();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchStaffList();
    }
  }, [isAdmin]);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff/list');
      setStaffList(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('staffDashboard', language as Lang)}
          </h1>
          <Button onClick={handleLogout} variant="outline">
            {t('logout', language as Lang)}
          </Button>
        </div>

        {/* Staff Info Card */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('welcome', language as Lang)}, {staff?.username}
          </h2>
          <p className="text-gray-600">
            {t('role', language as Lang)}: {staff?.role}
          </p>
        </Card>

        {/* Staff List (Admin Only) */}
        {isAdmin && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                {t('staffList', language as Lang)}
              </h2>
              <Button>
                {t('addStaff', language as Lang)}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {staffList.map((member) => (
                  <Card key={member.id} className="p-6">
                    <h3 className="text-lg font-medium mb-2">{member.username}</h3>
                    <p className="text-gray-600 mb-2">
                      {t('role', language as Lang)}: {member.role}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('joined', language as Lang)}: {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm">
                        {t('edit', language as Lang)}
                      </Button>
                      <Button variant="destructive" size="sm">
                        {t('delete', language as Lang)}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 