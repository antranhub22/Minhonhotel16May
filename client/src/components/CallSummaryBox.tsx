import React, { useEffect, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface CallSummary {
  id: string;
  callId: string;
  content: string;
  createdAt: string;
}

export const CallSummaryBox: React.FC<{ callId: string }> = ({ callId }) => {
  const { language } = useAssistant();
  const [summary, setSummary] = useState<CallSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lang = language as Lang;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/summaries/${callId}`);
        setSummary(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch summary');
      } finally {
        setLoading(false);
      }
    };
    if (callId) fetchSummary();
  }, [callId]);

  if (loading) return <div className="p-4 text-gray-500">{t('loading', lang)}...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!summary) return <div className="p-4 text-gray-400">{t('noSummary', lang)}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">{t('callSummary', lang)}</h2>
      <div className="text-sm whitespace-pre-line">{summary.content}</div>
      <div className="text-xs text-gray-400 mt-2">{t('createdAt', lang)}: {new Date(summary.createdAt).toLocaleString()}</div>
    </div>
  );
}; 