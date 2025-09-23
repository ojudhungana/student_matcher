// Mock users, matches, connections, and helpers for development.
import { UserProfile, MatchSuggestion, Connection } from '@/types';

// Mock user profiles for development
export const mockProfiles: UserProfile[] = [
  {
    id: '1',
    email: 'alice@university.edu',
    name: 'Alice Johnson',
    age: 20,
    ageRangeMin: 18,
    ageRangeMax: 22,
    major: 'Computer Science',
    year: 'Junior',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b029?w=400',
    interests: ['Gaming', 'Technology', 'Music', 'Reading'],
    classes: ['CS 301', 'MATH 210', 'PHYS 101'],
    bio: 'Love coding and playing video games. Always up for a good book or concert!',
    university: 'State University',
    isProfileComplete: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: '2',
    email: 'bob@university.edu',
    name: 'Bob Smith',
    age: 21,
    ageRangeMin: 19,
    ageRangeMax: 23,
    major: 'Business Administration',
    year: 'Senior',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    interests: ['Sports', 'Business', 'Travel', 'Fitness'],
    classes: ['BUS 401', 'ECON 301', 'MGMT 350'],
    bio: 'Entrepreneur at heart. Love networking and staying active!',
    university: 'State University',
    isProfileComplete: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z',
  },
  {
    id: '3',
    email: 'carol@university.edu',
    name: 'Carol Davis',
    age: 19,
    ageRangeMin: 18,
    ageRangeMax: 21,
    major: 'Psychology',
    year: 'Sophomore',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    interests: ['Psychology', 'Art', 'Volunteering', 'Dancing'],
    classes: ['PSYC 201', 'ART 150', 'SOC 101'],
    bio: 'Passionate about understanding people and making a difference in the world.',
    university: 'State University',
    isProfileComplete: true,
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-25T09:15:00Z',
  },
  {
    id: '4',
    email: 'david@university.edu',
    name: 'David Wilson',
    age: 22,
    ageRangeMin: 20,
    ageRangeMax: 24,
    major: 'Engineering',
    year: 'Senior',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    interests: ['Engineering', 'Outdoors', 'Photography', 'Science'],
    classes: ['ENGR 401', 'MATH 310', 'PHYS 301'],
    bio: 'Building the future one project at a time. Love hiking and capturing moments.',
    university: 'State University',
    isProfileComplete: true,
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-28T16:45:00Z',
  },
];

// Additional mock profiles for more variety
const additionalProfiles: UserProfile[] = [
  {
    id: '5',
    email: 'emma@university.edu',
    name: 'Emma Thompson',
    age: 20,
    ageRangeMin: 19,
    ageRangeMax: 22,
    major: 'Art',
    year: 'Sophomore',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b029?w=400',
    interests: ['Art', 'Photography', 'Music', 'Travel'],
    classes: ['ART 201', 'PHOTO 150', 'HIST 101'],
    bio: 'Creative soul who loves capturing life through art and photography.',
    university: 'State University',
    isProfileComplete: true,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z',
  },
  {
    id: '6',
    email: 'michael@university.edu',
    name: 'Michael Chen',
    age: 21,
    ageRangeMin: 20,
    ageRangeMax: 23,
    major: 'Mathematics',
    year: 'Junior',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    interests: ['Mathematics', 'Gaming', 'Technology', 'Science'],
    classes: ['MATH 310', 'CS 201', 'PHYS 201'],
    bio: 'Math enthusiast who codes in spare time. Love solving complex problems!',
    university: 'State University',
    isProfileComplete: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-28T15:30:00Z',
  },
  {
    id: '7',
    email: 'sarah@university.edu',
    name: 'Sarah Martinez',
    age: 19,
    ageRangeMin: 18,
    ageRangeMax: 21,
    major: 'Communications',
    year: 'Freshman',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    interests: ['Communications', 'Writing', 'Social Media', 'Music'],
    classes: ['COMM 101', 'ENG 150', 'SOC 101'],
    bio: 'Aspiring journalist who loves storytelling and connecting with people.',
    university: 'State University',
    isProfileComplete: true,
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-29T15:30:00Z',
  },
];

// Mock match suggestions
export const mockMatchSuggestions: MatchSuggestion[] = [
  {
    id: 'match-1',
    user: mockProfiles[1],
    sharedInterests: ['Technology', 'Gaming'],
    sharedClasses: ['MATH 210'],
    compatibilityScore: 85,
  },
  {
    id: 'match-2',
    user: mockProfiles[2],
    sharedInterests: ['Art', 'Reading'],
    sharedClasses: [],
    compatibilityScore: 72,
  },
  {
    id: 'match-3',
    user: mockProfiles[3],
    sharedInterests: ['Science', 'Photography'],
    sharedClasses: ['PHYS 101'],
    compatibilityScore: 78,
  },
  {
    id: 'match-4',
    user: additionalProfiles[0],
    sharedInterests: ['Art', 'Photography', 'Music'],
    sharedClasses: [],
    compatibilityScore: 82,
  },
  {
    id: 'match-5',
    user: additionalProfiles[1],
    sharedInterests: ['Technology', 'Gaming'],
    sharedClasses: ['MATH 310'],
    compatibilityScore: 88,
  },
  {
    id: 'match-6',
    user: additionalProfiles[2],
    sharedInterests: ['Music', 'Writing'],
    sharedClasses: [],
    compatibilityScore: 69,
  },
  // Add more repeating patterns to simulate pagination
  {
    id: 'match-7',
    user: { ...mockProfiles[1], id: '8', name: 'Alex Johnson', email: 'alex@university.edu' },
    sharedInterests: ['Sports', 'Fitness'],
    sharedClasses: ['BUS 201'],
    compatibilityScore: 75,
  },
  {
    id: 'match-8',
    user: { ...mockProfiles[2], id: '9', name: 'Jessica Lee', email: 'jessica@university.edu' },
    sharedInterests: ['Psychology', 'Volunteering'],
    sharedClasses: ['PSYC 201'],
    compatibilityScore: 80,
  },
];

// Mock connections
export const mockConnections: Connection[] = [
  {
    id: 'conn-1',
    user: mockProfiles[1],
    matchedAt: '2024-01-25T10:00:00Z',
    lastMessageAt: '2024-01-28T14:30:00Z',
    sharedInterests: ['Technology', 'Gaming'],
    sharedClasses: ['MATH 210'],
  },
  {
    id: 'conn-2',
    user: mockProfiles[2],
    matchedAt: '2024-01-23T16:15:00Z',
    sharedInterests: ['Art', 'Reading'],
    sharedClasses: [],
  },
];

// Mock current user
export const mockCurrentUser: UserProfile = mockProfiles[0];

// Helper functions for mock API responses
export const getMockProfile = (id?: string): UserProfile => {
  if (!id) return mockCurrentUser;
  return mockProfiles.find(p => p.id === id) || mockCurrentUser;
};

export const getMockMatchSuggestions = (page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const suggestions = mockMatchSuggestions.slice(start, end);
  
  return {
    data: suggestions,
    pagination: {
      page,
      limit,
      total: mockMatchSuggestions.length,
      totalPages: Math.ceil(mockMatchSuggestions.length / limit),
    },
  };
};

export const getMockConnections = (page = 1, limit = 20) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const connections = mockConnections.slice(start, end);
  
  return {
    data: connections,
    pagination: {
      page,
      limit,
      total: mockConnections.length,
      totalPages: Math.ceil(mockConnections.length / limit),
    },
  };
};
