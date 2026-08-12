import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Student {
  id: string;
  studentName: string;
  email: string;
  studentStatus: 'Active' | 'Inactive';
  createdDate: string;
  shopifyCustomerId?: string | null;
  shop: string;
  token?: string;
}

export interface EnrollmentDetails {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  enrollmentStatus: 'In Progress' | 'Completed';
  shop: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  category: string;
  duration: string;
}

export interface RegisterStudentRequest {
  studentName: string;
  email: string;
  password: string;
  enrolledCourseId?: string;
}

export interface LoginStudentRequest {
  email: string;
  password: string;
}

export interface UpdateStudentRequest {
  id: string;
  studentName?: string;
  email?: string;
  studentStatus?: 'Active' | 'Inactive';
  shopifyCustomerId?: string | null;
}

interface MerchantDashboardData {
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalEnrollments: number;
    completedEnrollments: number;
    activeEnrollments: number;
  };
  recentEnrollments: EnrollmentDetails[];
}

interface StudentContextType {
  students: Student[];
  currentStudent: Student | null;
  studentEnrollments: EnrollmentDetails[];
  allShopEnrollments: EnrollmentDetails[];
  dashboardData: MerchantDashboardData | null;
  activeShop: string;
  loading: boolean;
  error: string | null;
  fetchAllStudents: (adminToken: string) => Promise<void>;
  fetchStudentById: (id: string, adminToken: string) => Promise<Student | null>;
  registerStudent: (data: RegisterStudentRequest) => Promise<boolean>;
  loginStudent: (credentials: LoginStudentRequest) => Promise<boolean>;
  updateStudentProfile: (data: UpdateStudentRequest) => Promise<boolean>;
  adminUpdateStudent: (data: UpdateStudentRequest, adminToken: string) => Promise<boolean>;
  adminDeleteStudent: (id: string, adminToken: string) => Promise<boolean>;
  logout: () => void;
  
  // Enrollment operations
  fetchStudentEnrollments: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<boolean>;
  adminEnrollStudent: (studentId: string, courseId: string, adminToken: string) => Promise<boolean>;
  adminFetchAllEnrollments: (adminToken: string) => Promise<void>;
  adminUpdateEnrollment: (enrollmentId: string, status: 'In Progress' | 'Completed', adminToken: string) => Promise<boolean>;
  adminDeleteEnrollment: (enrollmentId: string, adminToken: string) => Promise<boolean>;
  adminFetchDashboardStats: (adminToken: string) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:1000/student';

export const StudentProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<EnrollmentDetails[]>([]);
  const [allShopEnrollments, setAllShopEnrollments] = useState<EnrollmentDetails[]>([]);
  const [dashboardData, setDashboardData] = useState<MerchantDashboardData | null>(null);
  const [activeShop, setActiveShop] = useState<string>('test-shop.myshopify.com');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize shop and session from localStorage or URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopQuery = urlParams.get('shop');
    if (shopQuery) {
      setActiveShop(shopQuery);
      localStorage.setItem('active_student_shop', shopQuery);
    } else {
      const savedShop = localStorage.getItem('active_student_shop') || localStorage.getItem('shopify_shop');
      if (savedShop) {
        setActiveShop(savedShop);
      }
    }

    const savedStudent = localStorage.getItem('currentStudent');
    if (savedStudent) {
      try {
        setCurrentStudent(JSON.parse(savedStudent));
      } catch (e) {
        localStorage.removeItem('currentStudent');
      }
    }
  }, []);

  // Fetch student's own enrollments automatically on login
  useEffect(() => {
    if (currentStudent && currentStudent.token) {
      fetchStudentEnrollments();
    } else {
      setStudentEnrollments([]);
    }
  }, [currentStudent]);

  // Fetch student's own enrollments (Student Portal)
  const fetchStudentEnrollments = async () => {
    if (!currentStudent || !currentStudent.token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/student-enrollments?studentId=${currentStudent.id}&shop=${activeShop}`, {
        headers: {
          'Authorization': `Bearer ${currentStudent.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }
      const data = await response.json();
      setStudentEnrollments(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Enroll in a new course (Student Portal)
  const enrollInCourse = async (courseId: string): Promise<boolean> => {
    if (!currentStudent || !currentStudent.token) return false;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/student-enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentStudent.token}`,
        },
        body: JSON.stringify({ courseId }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to enroll');
      }
      await fetchStudentEnrollments();
      return true;
    } catch (err: any) {
      setError(err.message || 'Enrollment failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Enroll a student (Merchant Portal)
  const adminEnrollStudent = async (studentId: string, courseId: string, adminToken: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin-enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': activeShop,
        },
        body: JSON.stringify({ studentId, courseId }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to enroll student');
      }
      await adminFetchAllEnrollments(adminToken);
      await adminFetchDashboardStats(adminToken);
      return true;
    } catch (err: any) {
      setError(err.message || 'Enrollment failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Fetch all enrollments in the shop (Merchant Portal)
  const adminFetchAllEnrollments = async (adminToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin-enrollments`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': activeShop,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch store enrollments');
      const data = await response.json();
      setAllShopEnrollments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Admin: Update enrollment status (Merchant Portal)
  const adminUpdateEnrollment = async (enrollmentId: string, status: 'In Progress' | 'Completed', adminToken: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': activeShop,
        },
        body: JSON.stringify({ enrollmentStatus: status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      await adminFetchAllEnrollments(adminToken);
      await adminFetchDashboardStats(adminToken);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update enrollment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Delete enrollment (Merchant Portal)
  const adminDeleteEnrollment = async (enrollmentId: string, adminToken: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': activeShop,
        },
      });
      if (!response.ok) throw new Error('Failed to delete enrollment');
      await adminFetchAllEnrollments(adminToken);
      await adminFetchDashboardStats(adminToken);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete enrollment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Fetch dashboard statistics (Merchant Portal)
  const adminFetchDashboardStats = async (adminToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin-dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': activeShop,
        },
      });
      if (!response.ok) throw new Error('Failed to load dashboard statistics');
      const data = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve stats');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all students (Merchant Portal)
  const fetchAllStudents = async (adminToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': activeShop,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch students list');
      const data = await response.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student details by ID
  const fetchStudentById = async (id: string, adminToken: string): Promise<Student | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/${id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': activeShop,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch student details');
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load student profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Register student (Student Portal)
  const registerStudent = async (studentData: RegisterStudentRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...studentData, shop: activeShop }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Registration failed');
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login student (Student Portal)
  const loginStudent = async (credentials: LoginStudentRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, shop: activeShop }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Invalid email or password');
      }
      const data = await response.json();
      const student: Student = data.student;
      setCurrentStudent(student);
      localStorage.setItem('currentStudent', JSON.stringify(student));
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update own profile (Student Portal)
  const updateStudentProfile = async (updatedData: UpdateStudentRequest): Promise<boolean> => {
    if (!currentStudent || !currentStudent.token) return false;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/student-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentStudent.token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to update profile');
      }
      const data = await response.json();
      const updated = { ...data.student, token: currentStudent.token };
      setCurrentStudent(updated);
      localStorage.setItem('currentStudent', JSON.stringify(updated));
      return true;
    } catch (err: any) {
      setError(err.message || 'Update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Update student details (Merchant Portal)
  const adminUpdateStudent = async (updatedData: UpdateStudentRequest, adminToken: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/${updatedData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': activeShop,
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to update student');
      }
      await fetchAllStudents(adminToken);
      return true;
    } catch (err: any) {
      setError(err.message || 'Admin student edit failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Delete student (Merchant Portal)
  const adminDeleteStudent = async (id: string, adminToken: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Shop-Domain': activeShop,
        },
      });
      if (!response.ok) throw new Error('Failed to delete student');
      setStudents((prev) => prev.filter((s) => s.id !== id));
      await adminFetchAllEnrollments(adminToken);
      await adminFetchDashboardStats(adminToken);
      return true;
    } catch (err: any) {
      setError(err.message || 'Delete failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentStudent(null);
    setStudentEnrollments([]);
    localStorage.removeItem('currentStudent');
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        currentStudent,
        studentEnrollments,
        allShopEnrollments,
        dashboardData,
        activeShop,
        loading,
        error,
        fetchAllStudents,
        fetchStudentById,
        registerStudent,
        loginStudent,
        updateStudentProfile,
        adminUpdateStudent,
        adminDeleteStudent,
        logout,
        
        // Enrollments
        fetchStudentEnrollments,
        enrollInCourse,
        adminEnrollStudent,
        adminFetchAllEnrollments,
        adminUpdateEnrollment,
        adminDeleteEnrollment,
        adminFetchDashboardStats,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};