import axios from "axios";
import { JwtResponse } from "../types/JwtResponse";
import { Auth } from "../types/auth";
import { Account } from "../types/Account";

const BASE_URL = "http://localhost:8080/api/v1/auth";

export interface RegisterRequestDTO {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export const login = async (email: string, password: string): Promise<Auth> => {
  const response = await axios.post(`${BASE_URL}/login`, { email, password });
  return response.data;
};

export const loginWithGoogle = async (token: string): Promise<Auth> => {
  const response = await axios.post(`${BASE_URL}/login-with-google`, token);
  return response.data;
};

export const register = async (
  registerRequestDTO: RegisterRequestDTO
): Promise<boolean> => {
  const response = await axios.post(`${BASE_URL}/register`, registerRequestDTO);
  return response.status === 201;
};

export const logout = async (token: string) => {
  const response = await axios.get(`${BASE_URL}/logout`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getCurrentUser = async (token: string): Promise<Account> => {
  const response = await axios.get(`${BASE_URL}/me`, {
    params: { token },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const refreshToken = async (token: string): Promise<JwtResponse> => {
  const response = await axios.post(`${BASE_URL}/refreshToken`, { token });
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await axios.post(`${BASE_URL}/forgot-password`, { email });
  return response;
};
interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
export const resetPassword = async (data: ResetPasswordRequestDTO) => {
  const response = await axios.post(`${BASE_URL}/reset-password`, data);
  return response;
};
