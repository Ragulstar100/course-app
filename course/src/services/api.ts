import type { StudentAuthResponse, Student } from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://course-api-veiu.onrender.com';
const DEFAULT_SHOP = 'quickstart-shop.myshopify.com';

// Helper to get headers
const getHeaders = (token?: string | null) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Shop-Domain': DEFAULT_SHOP,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Check if backend server is online
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'GET',
        headers: getHeaders(),
        // Set a short timeout for health check
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch (error) {
      console.warn('Backend server connection failed:', error);
      return false;
    }
  },

  // Register student
  async register(studentName: string, email: string, password: string, shop: string = DEFAULT_SHOP): Promise<StudentAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/student/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ studentName, email, password, shop }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Registration failed');
    }
    return data.student;
  },

  // Login student
  async login(email: string, password: string, shop: string = DEFAULT_SHOP): Promise<StudentAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/student/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, shop }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Login failed');
    }
    return data.student;
  },

  // Get student profile
  async getProfile(token: string): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/student/student-profile`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.details || data.error || 'Failed to fetch profile');
    }
    return await response.json();
  },

  // Update student profile
  async updateProfile(token: string, studentName: string, email: string, phone?: string, course?: string, bio?: string, shop: string = DEFAULT_SHOP): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/student/student-profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ studentName, email, phone, course, bio, shop }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to update profile');
    }
    return data.student;
  },

  // GET all courses
  async getCourses(shop: string = DEFAULT_SHOP): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/courses?shop=${shop}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to retrieve courses');
    }
    return await response.json();
  },

  // CREATE course
  async createCourse(courseData: { courseTitle: string; description: string; instructorName: string; category: string; duration: string; courseStatus: string }, token?: string | null): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(courseData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to create course');
    }
    return data.course;
  },

  // UPDATE course
  async updateCourse(id: string, courseData: { courseTitle: string; description: string; instructorName: string; category: string; duration: string; courseStatus: string }, token?: string | null): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(courseData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to update course');
    }
    return data.course;
  },

  // DELETE course
  async deleteCourse(id: string, token?: string | null): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.details || data.error || 'Failed to delete course');
    }
    return true;
  },

  // Get student enrollments
  async getStudentEnrollments(token: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/student/student-enrollments`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch enrollments');
    }
    return await response.json();
  },

  // Enroll in a course (Purchase)
  async enrollInCourse(token: string, courseId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/student/student-enroll`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ courseId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to enroll');
    }
    return data.enrollment;
  }
};
