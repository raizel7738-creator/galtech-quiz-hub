import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    // Do not auto-logout for Judge0 proxy errors
    if (error.response?.status === 401 && !url.startsWith('/judge0')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Categories API functions
export const categoriesAPI = {
  // Get all active categories
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // Get all categories (admin only)
  getAllCategories: async (params = {}) => {
    const response = await api.get('/categories/all', { params });
    return response.data;
  },

  // Get single category by ID
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category (admin only)
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category (admin only)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (admin only)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Toggle category status (admin only)
  toggleCategoryStatus: async (id) => {
    const response = await api.patch(`/categories/${id}/toggle-status`);
    return response.data;
  },
};

// Questions API functions
export const questionsAPI = {
  // Get questions by category (public - for students)
  getQuestionsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/questions/category/${categoryId}`, { params });
    return response.data;
  },

  // Admin only - get all questions
  getAllQuestions: async (params = {}) => {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  // Get single question (admin only)
  getQuestion: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Create question (admin only)
  createQuestion: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  // Update question (admin only)
  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  // Delete question (admin only)
  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  // Toggle question status (admin only)
  toggleQuestionStatus: async (id) => {
    const response = await api.patch(`/questions/${id}/toggle-status`);
    return response.data;
  },

  // Get question statistics (admin only)
  getQuestionStats: async () => {
    const response = await api.get('/questions/stats');
    return response.data;
  },
};

// Quiz Session API functions
export const quizSessionAPI = {
  // Start a new quiz session
  startQuizSession: async (sessionData) => {
    const response = await api.post('/quiz-sessions/start', sessionData);
    return response.data;
  },

  // Get active quiz session for a category
  getActiveQuizSession: async (categoryId) => {
    const response = await api.get(`/quiz-sessions/active/${categoryId}`);
    return response.data;
  },

  // Submit answer for a question
  submitAnswer: async (sessionId, answerData) => {
    const response = await api.post(`/quiz-sessions/${sessionId}/answer`, answerData);
    return response.data;
  },

  // Submit quiz session (complete the quiz)
  submitQuizSession: async (sessionId) => {
    const response = await api.post(`/quiz-sessions/${sessionId}/submit`);
    return response.data;
  },

  // Get quiz session results
  getQuizResults: async (sessionId) => {
    const response = await api.get(`/quiz-sessions/${sessionId}/results`);
    return response.data;
  },

  // Get user's quiz history
  getQuizHistory: async (params = {}) => {
    const response = await api.get('/quiz-sessions/history', { params });
    return response.data;
  },

  // Abandon quiz session
  abandonQuizSession: async (sessionId) => {
    const response = await api.post(`/quiz-sessions/${sessionId}/abandon`);
    return response.data;
  },
};

// Attempt History API functions
export const attemptHistoryAPI = {
  // Create attempt history from quiz session
  createAttemptHistory: async (sessionId) => {
    const response = await api.post('/attempt-history/create', { sessionId });
    return response.data;
  },

  // Get user's attempt history
  getAttemptHistory: async (params = {}) => {
    const response = await api.get('/attempt-history', { params });
    return response.data;
  },

  // Get detailed attempt history by ID
  getAttemptDetails: async (id) => {
    const response = await api.get(`/attempt-history/${id}`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async (params = {}) => {
    const response = await api.get('/attempt-history/stats', { params });
    return response.data;
  },

  // Get performance analytics
  getPerformanceAnalytics: async (params = {}) => {
    const response = await api.get('/attempt-history/analytics', { params });
    return response.data;
  },

  // Export attempt history
  exportAttemptHistory: async (params = {}) => {
    const response = await api.get('/attempt-history/export', { params });
    return response.data;
  },

  // Get category statistics (admin only)
  getCategoryStats: async (categoryId) => {
    const response = await api.get(`/attempt-history/category-stats/${categoryId}`);
    return response.data;
  },
};

// Judge0 proxy
export const judge0API = {
  run: async ({ language_id, source_code, stdin }) => {
    const response = await api.post('/judge0/run', { language_id, source_code, stdin });
    return response.data;
  }
};

// Lightweight challenges proxy for run/submit
export const challengesAPI = {
  list: async () => {
    const response = await api.get('/challenges');
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },
  submit: async (id, payload) => {
    const response = await api.post(`/challenges/${id}/submit`, payload);
    return response.data;
  },
  adminSubmissions: async () => {
    const response = await api.get('/challenges/admin/submissions');
    return response.data;
  }
};

// Coding Challenge API functions
export const codingChallengeAPI = {
  // Get all coding challenges
  getCodingChallenges: async (params = {}) => {
    const response = await api.get('/coding-challenges', { params });
    return response.data;
  },

  // Get single coding challenge
  getCodingChallenge: async (id) => {
    const response = await api.get(`/coding-challenges/${id}`);
    return response.data;
  },

  // Create coding challenge (admin only)
  createCodingChallenge: async (challengeData) => {
    const response = await api.post('/coding-challenges', challengeData);
    return response.data;
  },

  // Update coding challenge (admin only)
  updateCodingChallenge: async (id, challengeData) => {
    const response = await api.put(`/coding-challenges/${id}`, challengeData);
    return response.data;
  },

  // Delete coding challenge (admin only)
  deleteCodingChallenge: async (id) => {
    const response = await api.delete(`/coding-challenges/${id}`);
    return response.data;
  },

  // Toggle challenge status (admin only)
  toggleChallengeStatus: async (id) => {
    const response = await api.patch(`/coding-challenges/${id}/toggle-status`);
    return response.data;
  },

  // Get challenge statistics (admin only)
  getChallengeStats: async (id) => {
    const response = await api.get(`/coding-challenges/${id}/stats`);
    return response.data;
  },
};

// Users API functions (admin only)
export const usersAPI = {
  // Get all users with pagination and filtering
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  }
};

// Coding Submission API functions
export const codingSubmissionAPI = {
  // Submit code for a coding challenge
  submitCode: async (submissionData) => {
    const response = await api.post('/coding-submissions', submissionData);
    return response.data;
  },

  // Get student's submissions
  getMySubmissions: async (params = {}) => {
    const response = await api.get('/coding-submissions/my-submissions', { params });
    return response.data;
  },

  // Get single submission
  getSubmission: async (id) => {
    const response = await api.get(`/coding-submissions/${id}`);
    return response.data;
  },

  // Get all submissions (admin only)
  getAllSubmissions: async (params = {}) => {
    const response = await api.get('/coding-submissions', { params });
    return response.data;
  },

  // Review a submission (admin only)
  reviewSubmission: async (id, reviewData) => {
    const response = await api.put(`/coding-submissions/${id}/review`, reviewData);
    return response.data;
  },
};

// Test API functions
export const testAPI = {
  // Test backend connection
  testConnection: async () => {
    const response = await api.get('/test');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

