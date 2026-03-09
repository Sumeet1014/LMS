import apiClient, { ApiResponse, User, Subject } from '@/integrations/api/client';

export interface MentorStats {
  total_sessions: number;
  average_rating: number;
  unique_students: number;
}

export interface StudentStats {
  total_sessions: number;
  average_rating: number;
  unique_mentors: number;
}

// Profile API functions
export const profileApi = {
  // Get all mentors
  async getMentors(): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get('/profiles/mentors');
    return response.data;
  },

  // Get leaderboard
  async getLeaderboard(limit = 10): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get('/profiles/leaderboard', { params: { limit } });
    return response.data;
  },

  // Get user's own profile
  async getMyProfile(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/profiles/me');
    return response.data;
  },

  // Get profile by user ID
  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/profiles/user/${userId}`);
    return response.data;
  },

  // Get mentor stats
  async getMentorStats(mentorId: string): Promise<ApiResponse<MentorStats>> {
    const response = await apiClient.get(`/profiles/mentor-stats/${mentorId}`);
    return response.data;
  },

  // Get student stats
  async getStudentStats(studentId: string): Promise<ApiResponse<StudentStats>> {
    const response = await apiClient.get(`/profiles/student-stats/${studentId}`);
    return response.data;
  }
};

export default profileApi;
