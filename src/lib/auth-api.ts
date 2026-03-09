import apiClient, { ApiResponse, LoginCredentials, RegisterData, User } from '@/integrations/api/client';

// Authentication API functions
export const authApi = {
  // Register new user
  async register(data: RegisterData): Promise<ApiResponse<User> & { token?: string }> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<ApiResponse<User> & { token?: string }> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  // Become a mentor
  async becomeMentor(data: {
    username: string;
    bio: string;
    college_email: string;
    subjects: string[];
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.post('/auth/become-mentor', data);
    return response.data;
  },

  // Change password
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },

  // Logout
  async logout(): Promise<ApiResponse> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Store auth token and user data
  setAuthData(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
  },

  // Get stored auth token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Get stored user data
  getUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Clear auth data
  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Check if user is mentor
  isMentor(): boolean {
    const user = this.getUser();
    return user?.role === 'mentor' || user?.is_mentor === true;
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
};

export default authApi;
