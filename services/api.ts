import { Platform } from 'react-native';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

class ApiService {
  private config: ApiConfig;

  constructor() {
    this.config = {
      baseURL: __DEV__ ? 'http://localhost:3000/api' : 'https://api.tradingapp.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(Platform.OS !== 'web' && {
          'User-Agent': `TradingApp/${Platform.OS}`,
        }),
      },
    };

    console.log('ApiService initialized with config:', this.config);
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API Response: ${endpoint}`, data);

      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      
      let errorMessage = 'Network request failed';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        error: errorMessage,
        success: false,
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  setAuthToken(token: string) {
    this.config.headers['Authorization'] = `Bearer ${token}`;
    console.log('API: Auth token set');
  }

  removeAuthToken() {
    delete this.config.headers['Authorization'];
    console.log('API: Auth token removed');
  }
}

export const apiService = new ApiService();
export default apiService;