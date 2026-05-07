import axios from "axios";
import { getToken, removeToken } from "./storage";
import Constants from 'expo-constants';
import { router } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

if (!API_URL) {
  console.error('API_URL not found! Check your .env file');
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isHandling401 = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isHandling401) {
      isHandling401 = true;
      await removeToken();
      router.replace("/(auth)/signin");
      setTimeout(() => { isHandling401 = false; }, 3000);
    }
    return Promise.reject(error);
  }
);
