import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
}

interface EmailRecipient {
  id: number;
  email: string;
  name: string;
  isActive: boolean;
}

export const EmailSettings: React.FC = () => {
  const { language } = useAssistant();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState({ email: '', name: '' });

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const fetchEmailSettings = async () => {
    try {
      setLoading(true);
      const [templatesRes, recipientsRes] = await Promise.all([
        axios.get('/api/email/templates'),
        axios.get('/api/email/recipients')
      ]);
      setTemplates(templatesRes.data);
      setRecipients(recipientsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateToggle = async (templateId: number) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      await axios.patch(`/api/email/templates/${templateId}`, {
        isActive: !template.isActive
      });

      setTemplates(templates.map(t => 
        t.id === templateId ? { ...t, isActive: !t.isActive } : t
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update template');
    }
  };

  const handleRecipientToggle = async (recipientId: number) => {
    try {
      const recipient = recipients.find(r => r.id === recipientId);
      if (!recipient) return;

      await axios.patch(`/api/email/recipients/${recipientId}`, {
        isActive: !recipient.isActive
      });

      setRecipients(recipients.map(r => 
        r.id === recipientId ? { ...r, isActive: !r.isActive } : r
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update recipient');
    }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/email/recipients', newRecipient);
      setRecipients([...recipients, response.data]);
      setNewRecipient({ email: '', name: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add recipient');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('emailSettings', language as Lang)}
          </h1>
          <Button onClick={fetchEmailSettings}>
            {t('refresh', language as Lang)}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email Templates */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('emailTemplates', language as Lang)}
              </h2>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.subject}</p>
                    </div>
                    <Switch
                      checked={template.isActive}
                      onCheckedChange={() => handleTemplateToggle(template.id)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Email Recipients */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('emailRecipients', language as Lang)}
              </h2>
              
              {/* Add New Recipient */}
              <form onSubmit={handleAddRecipient} className="mb-6">
                <div className="flex space-x-4">
                  <Input
                    type="email"
                    placeholder={t('emailAddress', language as Lang)}
                    value={newRecipient.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setNewRecipient({ ...newRecipient, email: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="text"
                    placeholder={t('name', language as Lang)}
                    value={newRecipient.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setNewRecipient({ ...newRecipient, name: e.target.value })
                    }
                    required
                  />
                  <Button type="submit">
                    {t('add', language as Lang)}
                  </Button>
                </div>
              </form>

              {/* Recipients List */}
              <div className="space-y-4">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{recipient.name}</h3>
                      <p className="text-sm text-gray-500">{recipient.email}</p>
                    </div>
                    <Switch
                      checked={recipient.isActive}
                      onCheckedChange={() => handleRecipientToggle(recipient.id)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}; 