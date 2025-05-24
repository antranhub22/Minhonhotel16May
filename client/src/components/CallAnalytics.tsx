import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Card } from './ui/card';
import { t, Lang } from '@/i18n';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  totalCalls: number;
  averageDuration: string;
  totalDuration: string;
  callsByHour: {
    hour: number;
    count: number;
  }[];
  callsByDay: {
    day: string;
    count: number;
  }[];
  callsByCategory: {
    category: string;
    count: number;
  }[];
  topKeywords: {
    keyword: string;
    count: number;
  }[];
  sentimentDistribution: {
    sentiment: string;
    count: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const CallAnalytics: React.FC = () => {
  const { language } = useAssistant();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics?timeRange=${timeRange}`);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
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

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('callAnalytics', language as Lang)}
          </h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="day">{t('today', language as Lang)}</option>
            <option value="week">{t('thisWeek', language as Lang)}</option>
            <option value="month">{t('thisMonth', language as Lang)}</option>
            <option value="year">{t('thisYear', language as Lang)}</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">
              {t('totalCalls', language as Lang)}
            </h3>
            <p className="text-3xl font-bold">{data.totalCalls}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">
              {t('averageDuration', language as Lang)}
            </h3>
            <p className="text-3xl font-bold">{data.averageDuration}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">
              {t('totalDuration', language as Lang)}
            </h3>
            <p className="text-3xl font-bold">{data.totalDuration}</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Calls by Hour */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {t('callsByHour', language as Lang)}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.callsByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    name={t('numberOfCalls', language as Lang)}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Calls by Day */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {t('callsByDay', language as Lang)}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.callsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#82ca9d"
                    name={t('numberOfCalls', language as Lang)}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Calls by Category */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {t('callsByCategory', language as Lang)}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.callsByCategory}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.callsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Sentiment Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {t('sentimentDistribution', language as Lang)}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sentimentDistribution}
                    dataKey="count"
                    nameKey="sentiment"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.sentimentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Top Keywords */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {t('topKeywords', language as Lang)}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.topKeywords.map((keyword, index) => (
              <div
                key={keyword.keyword}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="font-medium">{keyword.keyword}</span>
                <span className="text-gray-500">{keyword.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}; 