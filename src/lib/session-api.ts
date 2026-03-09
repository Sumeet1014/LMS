import apiClient, { ApiResponse, SessionRequest } from '@/integrations/api/client';

export interface CreateSessionData {
  mentor_id: string;
  title: string;
  description?: string;
  subject_id?: string;
  requested_time: string;
  duration?: number;
}

export interface UpdateSessionStatusData {
  status: 'approved' | 'rejected' | 'completed';
  rejection_reason?: string;
}

// Session API functions
export const sessionApi = {
  // Create new session request
  async createSession(data: CreateSessionData): Promise<ApiResponse<SessionRequest>> {
    const response = await apiClient.post('/sessions', data);
    return response.data;
  },

  // Get user sessions (as mentor or student)
  async getUserSessions(status?: string): Promise<ApiResponse<SessionRequest[]>> {
    const params = status ? { status } : {};
    const response = await apiClient.get('/sessions', { params });
    return response.data;
  },

  // Get session by ID
  async getSession(id: string): Promise<ApiResponse<SessionRequest>> {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data;
  },

  // Update session status
  async updateSessionStatus(
    id: string, 
    data: UpdateSessionStatusData
  ): Promise<ApiResponse<SessionRequest>> {
    const response = await apiClient.put(`/sessions/${id}/status`, data);
    return response.data;
  },

  // Get upcoming sessions
  async getUpcomingSessions(): Promise<ApiResponse<SessionRequest[]>> {
    const response = await apiClient.get('/sessions/upcoming');
    return response.data;
  },

  // Get mentor sessions
  async getMentorSessions(status?: string): Promise<ApiResponse<SessionRequest[]>> {
    const params = status ? { status } : {};
    const response = await apiClient.get('/sessions/mentor', { params });
    return response.data;
  },

  // Get student sessions
  async getStudentSessions(status?: string): Promise<ApiResponse<SessionRequest[]>> {
    const params = status ? { status } : {};
    const response = await apiClient.get('/sessions/student', { params });
    return response.data;
  },

  // Generate video room ID
  async generateVideoRoom(id: string): Promise<ApiResponse<{ video_room_id: string }>> {
    const response = await apiClient.post(`/sessions/${id}/video-room`);
    return response.data;
  },

  // Get session statistics
  async getSessionStats(): Promise<ApiResponse<{
    total_sessions: number;
    completed_sessions: number;
    pending_sessions: number;
    approved_sessions: number;
  }>> {
    const response = await apiClient.get('/sessions/stats');
    return response.data;
  }
};

export default sessionApi;
