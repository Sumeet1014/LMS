import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  user?: T;
  users?: T[];
  sessions?: T[];
  mentors?: T[];
  challenges?: T[];
  resources?: T[];
  certificates?: T[];
  subjects?: T[];
  feedback?: T[];
  message?: string;
  error?: string;
  details?: any;
  success?: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: 'student' | 'mentor';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  created_at: string;
  username?: string;
  bio?: string;
  college_email?: string;
  is_mentor?: boolean;
  rating?: number;
  credits?: number;
  contribution_score?: number;
  subjects?: string[];
  total_sessions_attended?: number;
  total_sessions_taught?: number;
  availability?: any;
}

// Session types
export interface SessionRequest {
  id: string;
  mentor_id: string;
  student_id: string;
  title: string;
  description?: string;
  subject_id?: string;
  requested_time: string;
  duration?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'ongoing';
  rejection_reason?: string;
  responded_at?: string;
  video_room_id?: string;
  created_at: string;
  mentor_name?: string;
  student_name?: string;
  subject_name?: string;
}

// Message types
export interface Message {
  id: string;
  session_id?: string;
  room_id?: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  subject: string;
  description?: string;
  target_metric?: string;
  target_value?: number;
  points_reward?: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  current_value: number;
  completed: boolean;
  created_at: string;
}

// Quiz types
export interface QuizQuestion {
  id: string;
  question_text: string;
  marks: number;
  question_order?: number;
  options: QuizOption[];
}

export interface QuizOption {
  option_text: string;
  is_correct: boolean;
  option_order?: number;
}

export interface QuizAttempt {
  id: string;
  score: number;
  total: number;
  passed: boolean;
  completed_at?: string;
  created_at: string;
}

// Certificate types
export interface Certificate {
  id: string;
  title: string;
  user_id: string;
  badge_id?: string;
  challenge_id?: string;
  score?: number;
  pdf_url?: string;
  share_token: string;
  created_at: string;
}

// Subject types
export interface Subject {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

// Feedback types
export interface SessionFeedback {
  id: string;
  session_id: string;
  mentor_id: string;
  student_id: string;
  rating: number;
  feedback_text?: string;
  created_at: string;
  session_title?: string;
  student_name?: string;
}

export default apiClient;
