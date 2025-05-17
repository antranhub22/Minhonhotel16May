export interface Reference {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  createdAt: string;
}

export const mockReferences: Reference[] = [
  {
    id: '1',
    title: 'Hotel Policies',
    description: 'General policies and guidelines for hotel staff',
    url: '/references/hotel-policies',
    category: 'Policies',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Check-in Procedures',
    description: 'Step-by-step guide for guest check-in',
    url: '/references/check-in-procedures',
    category: 'Procedures',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    title: 'Emergency Contacts',
    description: 'Important emergency contact numbers',
    url: '/references/emergency-contacts',
    category: 'Emergency',
    createdAt: '2024-01-03T00:00:00Z'
  }
]; 