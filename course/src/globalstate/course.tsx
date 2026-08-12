import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Course {
  id: string;
  courseTitle: string;
  description: string;
  instructorName: string;
  category: string;
  duration: string;
  courseStatus: 'Active' | 'Inactive';
  createdDate: string;
  shopifyProductId?: string | null;
  shop: string;
}

export interface CreateCourseRequest {
  courseTitle: string;
  description: string;
  instructorName: string;
  category: string;
  duration: string;
  courseStatus: 'Active' | 'Inactive';
  shopifyProductId?: string | null;
}

export interface UpdateCourseRequest {
  id: string;
  courseTitle?: string;
  description?: string;
  instructorName?: string;
  category?: string;
  duration?: string;
  courseStatus?: 'Active' | 'Inactive';
  shopifyProductId?: string | null;
}

interface CourseContextType {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
  fetchAllCourses: (shop: string, adminToken?: string) => Promise<void>;
  fetchCourseById: (id: string, shop: string) => Promise<Course | null>;
  createCourse: (data: CreateCourseRequest, shop: string, adminToken: string) => Promise<boolean>;
  updateCourse: (data: UpdateCourseRequest, shop: string, adminToken: string) => Promise<boolean>;
  deleteCourse: (id: string, shop: string, adminToken: string) => Promise<boolean>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:1000/courses';

export const CourseProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all courses (GET /?shop=...)
  const fetchAllCourses = async (shop: string, adminToken?: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {
        'X-Shop-Domain': shop,
      };
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/?shop=${encodeURIComponent(shop)}`, {
        headers,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch course details by ID (GET /:id?shop=...)
  const fetchCourseById = async (id: string, shop: string): Promise<Course | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}?shop=${encodeURIComponent(shop)}`, {
        headers: {
          'X-Shop-Domain': shop,
        },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch course details');
      }
      const data = await response.json();
      setCurrentCourse(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching course details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a course (POST /) - Admin only
  const createCourse = async (courseData: CreateCourseRequest, shop: string, adminToken: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': shop,
        },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to create course');
      }
      await fetchAllCourses(shop, adminToken);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Edit a course (PUT /:id) - Admin only
  const updateCourse = async (
    { id, ...updatedData }: UpdateCourseRequest, 
    shop: string, 
    adminToken: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': shop,
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to update course');
      }
      await fetchAllCourses(shop, adminToken);
      return true;
    } catch (err: any) {
      setError(err.message || 'Update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a course (DELETE /:id) - Admin only
  const deleteCourse = async (id: string, shop: string, adminToken: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': shop,
        },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete course');
      }
      setCourses((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Delete failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        currentCourse,
        loading,
        error,
        fetchAllCourses,
        fetchCourseById,
        createCourse,
        updateCourse,
        deleteCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};
