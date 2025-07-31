import { Target, Clock, Star, Check, Archive } from 'lucide-react';

export const categories = [
  { id: 'all', name: 'All Tasks', icon: Target, color: '#6B7280' },
  { id: 'today', name: 'Today', icon: Clock, color: '#2563EB' },
  { id: 'important', name: 'Important', icon: Star, color: '#D97706' },
  { id: 'completed', name: 'Completed', icon: Check, color: '#059669' },
  { id: 'archived', name: 'Archived', icon: Archive, color: '#6B7280' }
];

export const priorities = [
  { id: 'high', name: 'High', color: '#EF4444' },
  { id: 'medium', name: 'Medium', color: '#F59E0B' },
  { id: 'low', name: 'Low', color: '#10B981' }
];

export const predefinedTags = ['Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Family'];