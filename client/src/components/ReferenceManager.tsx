import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { t, Lang } from '@/i18n';
import axios from 'axios';

interface Reference {
  id: number;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ReferenceManager: React.FC = () => {
  const { language } = useAssistant();
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newReference, setNewReference] = useState({
    title: '',
    content: '',
    category: '',
    isActive: true
  });

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/references');
      setReferences(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch references');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/references', newReference);
      setReferences([...references, response.data]);
      setIsAdding(false);
      setNewReference({
        title: '',
        content: '',
        category: '',
        isActive: true
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add reference');
    }
  };

  const handleUpdateReference = async (id: number, updates: Partial<Reference>) => {
    try {
      const response = await axios.patch(`/api/references/${id}`, updates);
      setReferences(references.map(ref => 
        ref.id === id ? response.data : ref
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update reference');
    }
  };

  const handleDeleteReference = async (id: number) => {
    try {
      await axios.delete(`/api/references/${id}`);
      setReferences(references.filter(ref => ref.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete reference');
    }
  };

  const filteredReferences = references.filter(ref => {
    const matchesSearch = 
      ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ref.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(references.map(ref => ref.category)))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('referenceManager', language as Lang)}
          </h1>
          <Button onClick={() => setIsAdding(true)}>
            {t('addReference', language as Lang)}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <Input
            type="text"
            placeholder={t('searchReferences', language as Lang)}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? t('allCategories', language as Lang) : category}
              </option>
            ))}
          </select>
        </div>

        {/* Add Reference Form */}
        {isAdding && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {t('addReference', language as Lang)}
            </h2>
            <form onSubmit={handleAddReference} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('title', language as Lang)}
                </label>
                <Input
                  type="text"
                  value={newReference.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewReference({ ...newReference, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('content', language as Lang)}
                </label>
                <Textarea
                  value={newReference.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setNewReference({ ...newReference, content: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('category', language as Lang)}
                </label>
                <Input
                  type="text"
                  value={newReference.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewReference({ ...newReference, category: e.target.value })
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

        {/* References List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : filteredReferences.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('noReferences', language as Lang)}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReferences.map((reference) => (
              <Card key={reference.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{reference.title}</h3>
                    <p className="text-sm text-gray-500">{reference.category}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateReference(reference.id, { isActive: !reference.isActive })}
                    >
                      {reference.isActive ? t('deactivate', language as Lang) : t('activate', language as Lang)}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteReference(reference.id)}
                    >
                      {t('delete', language as Lang)}
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{reference.content}</p>
                <div className="text-sm text-gray-500">
                  {t('lastUpdated', language as Lang)}: {new Date(reference.updatedAt).toLocaleString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 