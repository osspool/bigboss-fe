// api/user-data.ts
"server-only";

import { handleApiRequest } from "./api-handler";

export const UserRole = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  CUSTOMER: 'user',
  FINANCE_ADMIN: 'finance-admin',
  FINANCE_MANAGER: 'finance-manager',
  STORE_MANAGER: 'store-manager',
  WAREHOUSE_ADMIN: 'warehouse-admin',
  WAREHOUSE_STAFF: 'warehouse-staff',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  roles: UserRoleType[];
  image?: string;
  organization?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  success: boolean;
  token: string;
  refreshToken: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
}

export const forgetPassApi = async (data: { email: string }): Promise<ApiResponse> => {
  return handleApiRequest("POST", "/api/v1/auth/forgot-password", {
    body: data,
  });
};

export const resetPassApi = async (data: { newPassword: string; token: string }): Promise<ApiResponse> => {
  console.log("resetPassApi", data);
  return handleApiRequest("POST", "/api/v1/auth/reset-password", {
    body: data,
  });
};

export const tokenRefreshApi = async (data: { token: string }): Promise<RefreshResponse> => {
  return handleApiRequest("POST", "/api/v1/auth/refresh", {
    body: data,
  });
};

export const loginApi = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  return handleApiRequest("POST", "/api/v1/auth/login", {
    body: data,
  });
};

export const registerApi = async (data: { 
  name: string; 
  email: string; 
  password: string; 
  phone?: string 
}): Promise<ApiResponse> => {
  return handleApiRequest("POST", "/api/v1/auth/register", {
    body: data,
  });
};

export const oauthLoginApi = async (data: {
  email: string;
  name: string;
  provider: string;
  providerAccountId: string;
  image?: string;
}): Promise<AuthResponse & { access_token: string; refresh_token: string }> => {
  return handleApiRequest("POST", "/api/v1/auth/oauth-login", {
    body: data,
  });
};

export const getUser = async (email: string, token: string) => {
  const endpoint = `/api/v1/users?email=${email}`;
  return handleApiRequest("GET", endpoint, { token });
};

export const getUserByPhone = async (phone: string, token: string) => {
  const endpoint = `/api/v1/customers?phone=${phone}`;
  return handleApiRequest("GET", endpoint, { token });
};

export async function createUser(
  name: string, 
  email: string, 
  password: string, 
  phone?: string, 
  address?: string
) {
  const endpoint = "/api/v1/auth/register";
  return handleApiRequest("POST", endpoint, { body: { name, email, password, phone, address } });
}

export const getProfile = async (token: string) => {
  return handleApiRequest("GET", "/api/v1/users/me", { token });
};

export const updateUser = async (token: string, userId: string, data: Partial<User>) => {
  return handleApiRequest("PATCH", `/api/v1/users/me`, {
    token,
    body: data,
  });
};

