import apiClient, { ApiResponse, Challenge, ChallengeProgress, QuizQuestion, QuizAttempt } from '@/integrations/api/client';

// Challenge API functions
export const challengeApi = {
  // Get active challenges
  async getChallenges(): Promise<ApiResponse<Challenge[]>> {
    const response = await apiClient.get('/challenges');
    return response.data;
  },

  // Get user challenge progress
  async getChallengeProgress(): Promise<ApiResponse<ChallengeProgress[]>> {
    const response = await apiClient.get('/challenges/progress');
    return response.data;
  },

  // Update challenge progress
  async updateChallengeProgress(
    challengeId: string, 
    data: { current_value: number; completed: boolean }
  ): Promise<ApiResponse> {
    const response = await apiClient.post(`/challenges/progress/${challengeId}`, data);
    return response.data;
  },

  // Get quiz questions for challenge
  async getQuizQuestions(challengeId: string): Promise<ApiResponse<QuizQuestion[]>> {
    const response = await apiClient.get(`/quizzes/questions/${challengeId}`);
    return response.data;
  },

  // Submit quiz attempt
  async submitQuiz(data: {
    challengeId: string;
    answers: Record<string, string>;
  }): Promise<ApiResponse<QuizAttempt>> {
    const response = await apiClient.post('/quizzes/submit', data);
    return response.data;
  },

  // Get user quiz attempts
  async getQuizAttempts(challengeId?: string): Promise<ApiResponse<QuizAttempt[]>> {
    const params = challengeId ? { challengeId } : {};
    const response = await apiClient.get('/quizzes/attempts', { params });
    return response.data;
  }
};

export default challengeApi;
