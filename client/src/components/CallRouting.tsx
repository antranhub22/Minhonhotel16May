import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface RoutingRule {
  id: number;
  name: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
}

interface Agent {
  id: number;
  name: string;
  department: string;
  skills: string[];
  isAvailable: boolean;
}

export const CallRouting: React.FC = () => {
  const { language } = useAssistant();
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    condition: '',
    action: '',
    priority: 1,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rulesRes, agentsRes] = await Promise.all([
        axios.get('/api/routing/rules'),
        axios.get('/api/routing/agents')
      ]);
      setRules(rulesRes.data);
      setAgents(agentsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch routing data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/routing/rules', newRule);
      setRules([...rules, response.data]);
      setIsAdding(false);
      setNewRule({
        name: '',
        condition: '',
        action: '',
        priority: 1,
        isActive: true
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add routing rule');
    }
  };

  const handleUpdateRule = async (id: number, updates: Partial<RoutingRule>) => {
    try {
      const response = await axios.patch(`/api/routing/rules/${id}`, updates);
      setRules(rules.map(rule => 
        rule.id === id ? response.data : rule
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update routing rule');
    }
  };

  const handleDeleteRule = async (id: number) => {
    try {
      await axios.delete(`/api/routing/rules/${id}`);
      setRules(rules.filter(rule => rule.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete routing rule');
    }
  };

  const handleUpdateAgent = async (id: number, updates: Partial<Agent>) => {
    try {
      const response = await axios.patch(`/api/routing/agents/${id}`, updates);
      setAgents(agents.map(agent => 
        agent.id === id ? response.data : agent
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update agent');
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
            {t('callRouting', language as Lang)}
          </h1>
          <Button onClick={() => setIsAdding(true)}>
            {t('addRule', language as Lang)}
          </Button>
        </div>

        {/* Add Rule Form */}
        {isAdding && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {t('addRule', language as Lang)}
            </h2>
            <form onSubmit={handleAddRule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ruleName', language as Lang)}
                </label>
                <Input
                  type="text"
                  value={newRule.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewRule({ ...newRule, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('condition', language as Lang)}
                </label>
                <Input
                  type="text"
                  value={newRule.condition}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewRule({ ...newRule, condition: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('action', language as Lang)}
                </label>
                <Input
                  type="text"
                  value={newRule.action}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewRule({ ...newRule, action: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('priority', language as Lang)}
                </label>
                <Input
                  type="number"
                  min={1}
                  value={newRule.priority}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewRule({ ...newRule, priority: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  {t('cancel', language as Lang)}
                </Button>
                <Button type="submit">
                  {t('save', language as Lang)}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Routing Rules */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {t('routingRules', language as Lang)}
          </h2>
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{rule.name}</h3>
                    <p className="text-sm text-gray-500">
                      {t('condition', language as Lang)}: {rule.condition}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('action', language as Lang)}: {rule.action}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('priority', language as Lang)}: {rule.priority}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateRule(rule.id, { isActive: !rule.isActive })}
                    >
                      {rule.isActive ? t('deactivate', language as Lang) : t('activate', language as Lang)}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      {t('delete', language as Lang)}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Agents */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t('agents', language as Lang)}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{agent.name}</h3>
                    <p className="text-sm text-gray-500">
                      {t('department', language as Lang)}: {agent.department}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">
                        {t('skills', language as Lang)}:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {agent.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateAgent(agent.id, { isAvailable: !agent.isAvailable })}
                  >
                    {agent.isAvailable ? t('setUnavailable', language as Lang) : t('setAvailable', language as Lang)}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 