import type { StudentAuthResponse, Student } from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://course-api-veiu.onrender.com';

const getInitialShop = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlShop = params.get('shop');
    if (urlShop) {
      localStorage.setItem('course_shop_domain', urlShop);
      return urlShop;
    }
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.shop) return u.shop;
      } catch (e) {}
    }
    const storedShop = localStorage.getItem('course_shop_domain');
    if (storedShop) return storedShop;
  }
  return 'devstore-k71vvnrv.myshopify.com';
};

const DEFAULT_SHOP = getInitialShop();

// Helper to get headers
const getHeaders = (token?: string | null, customShop?: string | null) => {
  let shop = customShop || DEFAULT_SHOP;
  if (!customShop && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.shop) {
        shop = payload.shop;
      }
    } catch (e) {}
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Shop-Domain': shop,
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
  async register(studentName: string, email: string, password: string): Promise<StudentAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/student/register`, {
      method: 'POST',
      headers: getHeaders(null),
      body: JSON.stringify({ studentName, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Registration failed');
    }
    return data.student;
  },

  // Login merchant (Admin)
  async loginMerchant(username: string, password: string, shop: string = DEFAULT_SHOP): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/shopify/login`, {
      method: 'POST',
      headers: getHeaders(null, shop),
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Merchant login failed');
    }
    return data;
  },

  // Login student
  async login(email: string, password: string): Promise<StudentAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/student/login`, {
      method: 'POST',
      headers: getHeaders(null),
      body: JSON.stringify({ email, password }),
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

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to fetch profile');
    }
    return data;
  },

  // Update student profile
  async updateProfile(token: string, studentName: string, email: string, phone?: string, course?: string, bio?: string, shop: string = DEFAULT_SHOP): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/student/student-profile`, {
      method: 'PUT',
      headers: getHeaders(token, shop),
      body: JSON.stringify({ studentName, email, phone, course, bio, shop }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to update profile');
    }
    return data.student;
  },

  // GET all courses
  async getCourses(shop?: string): Promise<any[]> {
    const url = shop ? `${API_BASE_URL}/courses?shop=${shop}` : `${API_BASE_URL}/courses`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(null, shop),
    });
    if (!response.ok) {
      throw new Error(`Failed to retrieve courses (Status: ${response.status})`);
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
      throw new Error(`Failed to fetch enrollments (Status: ${response.status})`);
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
  },

  // Get all students (for admin)
  async getStudents(token: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/student`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch students list');
    }
    return await response.json();
  }
};
