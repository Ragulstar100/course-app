export interface Student {
  id: string;
  studentName: string;
  email: string;
  studentStatus: "Active" | "Inactive";
  createdDate: string;
  shopifyCustomerId?: string | null;
  shop: string;
  phone?: string;
  course?: string;
  bio?: string;
}

export interface StudentAuthResponse {
  id: string;
  studentName: string;
  email: string;
  studentStatus: "Active" | "Inactive";
  createdDate: string;
  shopifyCustomerId?: string | null;
  shop: string;
  token: string;
  phone?: string;
  course?: string;
  bio?: string;
}

export interface AuthState {
  user: StudentAuthResponse | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  serverOnline: boolean;
  checkingServer: boolean;
}
