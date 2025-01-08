import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/auth";

export interface RegisterRequestDTO {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${BASE_URL}/login`, { email, password });
  return response.data;
};

export const register = async (registerRequestDTO: RegisterRequestDTO) => {
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

export const getCurrentUser = async (token: string) => {
  const response = await axios.get(`${BASE_URL}/me`, {
    params: { token },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const refreshToken = async (token: string) => {
  const response = await axios.post(`${BASE_URL}/refreshToken`, { token });
  return response.data;
};
