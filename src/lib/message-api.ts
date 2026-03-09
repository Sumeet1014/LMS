import apiClient, { ApiResponse, Message } from '@/integrations/api/client';

export interface SendMessageData {
  content: string;
}

// Message API functions
export const messageApi = {
  // Send message to session
  async sendSessionMessage(sessionId: string, data: SendMessageData): Promise<ApiResponse<Message>> {
    const response = await apiClient.post(`/messages/sessions/${sessionId}`, data);
    return response.data;
  },

  // Get messages for session
  async getSessionMessages(
    sessionId: string, 
    options?: { limit?: number; offset?: number }
  ): Promise<ApiResponse<Message[]>> {
    const params = options || {};
    const response = await apiClient.get(`/messages/sessions/${sessionId}`, { params });
    return response.data;
  },

  // Send video chat message
  async sendVideoChatMessage(roomId: string, data: { message: string }): Promise<ApiResponse<Message>> {
    const response = await apiClient.post(`/messages/video-chat/${roomId}`, data);
    return response.data;
  },

  // Get video chat messages
  async getVideoChatMessages(
    roomId: string, 
    options?: { limit?: number; offset?: number }
  ): Promise<ApiResponse<Message[]>> {
    const params = options || {};
    const response = await apiClient.get(`/messages/video-chat/${roomId}`, { params });
    return response.data;
  }
};

export default messageApi;
