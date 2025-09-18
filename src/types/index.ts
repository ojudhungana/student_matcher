<<<<<<< HEAD
=======
// Shared TypeScript types and constants (e.g., UserProfile, YEARS, majors).
>>>>>>> aaa84261f8429e5f3b3bea0ebd897acd2a3f4f08
// User and Profile Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  ageRangeMin: number;
  ageRangeMax: number;
  major: string;
  year: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  profilePicture?: string;
  interests: string[];
  classes: string[];
  bio?: string;
  university: string;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  userMetadata: {
    university?: string;
    name?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Match Types
export interface MatchSuggestion {
  id: string;
  user: UserProfile;
  sharedInterests: string[];
  sharedClasses: string[];
  compatibilityScore: number;
}

export interface MatchRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Connection {
  id: string;
  user: UserProfile;
  matchedAt: string;
  lastMessageAt?: string;
  sharedInterests: string[];
  sharedClasses: string[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface ProfileFormData {
  name: string;
  age: number;
  ageRangeMin: number;
  ageRangeMax: number;
  major: string;
  year: UserProfile['year'];
  interests: string[];
  classes: string[];
  bio?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

// Notification Types
export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

// App State Types
export interface AppState {
  theme: 'light' | 'dark';
  notifications: AppNotification[];
  isOnline: boolean;
}

// University Types
export interface University {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  supportedMajors: string[];
}

// Constants
export const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'] as const;

export const COMMON_INTERESTS = [
  'Sports',
  'Music',
  'Gaming',
  'Art',
  'Reading',
  'Movies',
  'Cooking',
  'Travel',
  'Photography',
  'Technology',
  'Fitness',
  'Dancing',
  'Writing',
  'Outdoors',
  'Volunteering',
  'Science',
  'Politics',
  'Fashion',
  'Food',
  'Pets',
] as const;

export const COMMON_MAJORS = [
  'Computer Science',
  'Business Administration',
  'Psychology',
  'Engineering',
  'Biology',
  'English',
  'Mathematics',
  'History',
  'Political Science',
  'Economics',
  'Art',
  'Music',
  'Chemistry',
  'Physics',
  'Communications',
  'Nursing',
  'Education',
  'Criminal Justice',
  'Marketing',
  'Finance',
] as const;