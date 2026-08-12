import React, { createContext, useContext, useState, ReactNode, JSX } from 'react';
import { 
  Student, 
  RegisterStudentRequest, 
  LoginStudentRequest, 
  UpdateStudentRequest 
} from '../types/student.types';

interface StudentContextType {
  students: Student[];
  currentStudent: Student | null;
  loading: boolean;
  error: string | null;
  fetchAllStudents: () => Promise<void>;
  fetchStudentById: (id: string) => Promise<void>;
  registerStudent: (data: RegisterStudentRequest) => Promise<boolean>;
  loginStudent: (credentials: LoginStudentRequest) => Promise<boolean>;
  updateStudent: (data: UpdateStudentRequest) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:1000/student';

export const StudentProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 3. View all students (GET /)
  const fetchAllStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // 4. View individual student details (GET /:id)
  const fetchStudentById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch student details');
      const data = await response.json();
      setCurrentStudent(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // 1. Register a student (POST /register)
  const registerStudent = async (studentData: RegisterStudentRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) throw new Error('Registration failed');
      await fetchAllStudents();
      return true;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 2. Login a student (POST /login)
  const loginStudent = async (credentials: LoginStudentRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error('Invalid credentials');
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return true;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 5. Edit a student (PUT /:id)
  const updateStudent = async ({ id, ...updatedData }: UpdateStudentRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update student');
      await fetchAllStudents();
      return true;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 6. Delete a student (DELETE /:id)
  const deleteStudent = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete student');
      setStudents((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        currentStudent,
        loading,
        error,
        fetchAllStudents,
        fetchStudentById,
        registerStudent,
        loginStudent,
        updateStudent,
        deleteStudent,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

// Custom Hook to consume the context
export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};