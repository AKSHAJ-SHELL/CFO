/**
 * API client for FinPilot backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:8081';

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to get tokens from localStorage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('auth_access_token');
      this.refreshToken = localStorage.getItem('auth_refresh_token');
    }
  }

  setTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('auth_refresh_token', refreshToken);
      }
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_access_token');
      localStorage.removeItem('auth_refresh_token');
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: this.refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        this.setTokens(data.access, data.refresh || this.refreshToken);
        return data.access;
      } catch (error) {
        // If refresh fails, clear tokens and redirect to login
        this.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401: boolean = true
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized with token refresh
      if (response.status === 401 && retryOn401 && this.refreshToken) {
        try {
          // Attempt to refresh the token
          const newAccessToken = await this.refreshAccessToken();
          
          // Retry the original request with the new token
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          return await retryResponse.json();
        } catch (refreshError) {
          // Token refresh failed, clear tokens and throw error
          this.clearTokens();
          throw new Error('Authentication failed. Please login again.');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.request<{ access: string; refresh: string; user: any }>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    }, false); // Don't retry on login endpoint
    
    this.setTokens(response.access, response.refresh);
    return response;
  }

  async logout() {
    try {
      // Optionally call logout endpoint
      if (this.accessToken) {
        await this.request('/api/auth/logout/', {
          method: 'POST',
        }, false);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Invoices (Feature 1)
  async getInvoices(orgId: string) {
    return this.request(`/api/orgs/${orgId}/invoices/invoices/`);
  }

  async getCustomers(orgId: string) {
    return this.request(`/api/orgs/${orgId}/invoices/customers/`);
  }

  async getARAging(orgId: string) {
    return this.request(`/api/orgs/${orgId}/invoices/ar-aging/`);
  }

  // Scenarios (Feature 3)
  async getScenarios(orgId: string) {
    return this.request(`/api/orgs/${orgId}/planning/scenarios/`);
  }

  async getBudgets(orgId: string) {
    return this.request(`/api/orgs/${orgId}/planning/budgets/`);
  }

  async getGoals(orgId: string) {
    return this.request(`/api/orgs/${orgId}/planning/goals/`);
  }

  // Bills (Feature 4)
  async getVendors(orgId: string) {
    return this.request(`/api/orgs/${orgId}/billpay/vendors/`);
  }

  async getBills(orgId: string) {
    return this.request(`/api/orgs/${orgId}/billpay/bills/`);
  }

  // Profitability (Feature 5)
  async getCustomerProfitability(orgId: string) {
    return this.request(`/api/orgs/${orgId}/profitability/customer-profitability/`);
  }

  async getProducts(orgId: string) {
    return this.request(`/api/orgs/${orgId}/profitability/products/`);
  }

  // Health Score (Feature 6)
  async getHealthScore(orgId: string) {
    return this.request(`/api/orgs/${orgId}/health/scores/`);
  }

  // Reserves (Feature 7)
  async getReserveGoals(orgId: string) {
    return this.request(`/api/orgs/${orgId}/reserves/goals/`);
  }

  async createReserveGoal(orgId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/reserves/goals/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReserveGoal(orgId: string, goalId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/reserves/goals/${goalId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReserveGoal(orgId: string, goalId: string) {
    return this.request(`/api/orgs/${orgId}/reserves/goals/${goalId}/`, {
      method: 'DELETE',
    });
  }

  // Scenarios - CRUD operations
  async createScenario(orgId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/planning/scenarios/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScenario(orgId: string, scenarioId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/planning/scenarios/${scenarioId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteScenario(orgId: string, scenarioId: string) {
    return this.request(`/api/orgs/${orgId}/planning/scenarios/${scenarioId}/`, {
      method: 'DELETE',
    });
  }

  async runScenario(orgId: string, scenarioId: string) {
    return this.request(`/api/orgs/${orgId}/planning/scenarios/${scenarioId}/run/`, {
      method: 'POST',
    });
  }

  async getScenarioResults(orgId: string, scenarioId: string) {
    return this.request(`/api/orgs/${orgId}/planning/scenarios/${scenarioId}/results/`);
  }

  // Vendors - CRUD operations
  async createVendor(orgId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/billpay/vendors/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(orgId: string, vendorId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/billpay/vendors/${vendorId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(orgId: string, vendorId: string) {
    return this.request(`/api/orgs/${orgId}/billpay/vendors/${vendorId}/`, {
      method: 'DELETE',
    });
  }

  // Bills - CRUD operations
  async createBill(orgId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/billpay/bills/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadBill(orgId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    // Don't set Content-Type for FormData, browser will set it with boundary

    const response = await fetch(`${this.baseUrl}/api/orgs/${orgId}/billpay/bills/upload/`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateBill(orgId: string, billId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/billpay/bills/${billId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBill(orgId: string, billId: string) {
    return this.request(`/api/orgs/${orgId}/billpay/bills/${billId}/`, {
      method: 'DELETE',
    });
  }

  // Approval workflows
  async getApprovalWorkflows(orgId: string) {
    return this.request(`/api/orgs/${orgId}/billpay/workflows/`);
  }

  async approveBill(orgId: string, billId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/billpay/bills/${billId}/approve/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectBill(orgId: string, billId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/billpay/bills/${billId}/reject/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Profitability - Update operations
  async updateCustomerProfitability(orgId: string, customerId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/profitability/customer-profitability/${customerId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProductProfitability(orgId: string, productId: string, data: any) {
    return this.request(`/api/orgs/${orgId}/profitability/products/${productId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Health Score
  async calculateHealthScore(orgId: string) {
    return this.request(`/api/orgs/${orgId}/health/scores/calculate/`, {
      method: 'POST',
    });
  }

  async getLatestHealthScore(orgId: string) {
    const scores = await this.request<any[]>(`/api/orgs/${orgId}/health/scores/`);
    return scores.length > 0 ? scores[0] : null;
  }

  // Reports
  async generateReport(orgId: string, reportType: string, format: 'pdf' | 'excel' = 'pdf') {
    return this.request(`/api/orgs/${orgId}/reports/generate/`, {
      method: 'POST',
      body: JSON.stringify({ type: reportType, format }),
    });
  }

  async downloadReport(orgId: string, reportId: string) {
    const response = await fetch(`${this.baseUrl}/api/orgs/${orgId}/reports/${reportId}/download/`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return blob;
  }

  // Forecasting
  async getForecast(orgId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    return this.request(`/api/orgs/${orgId}/forecast/?period=${period}`);
  }

  // AI CFO Chat
  async sendChatMessage(orgId: string, message: string, context?: any) {
    return this.request(`/api/orgs/${orgId}/chat/message/`, {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getChatHistory(orgId: string) {
    return this.request(`/api/orgs/${orgId}/chat/history/`);
  }

  // Chat Service Methods
  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${CHAT_SERVICE_URL}/api/upload/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }
    
    return response.json();
  }

  async parseFile(uploadId: string, mapping?: Record<string, string>): Promise<any> {
    const response = await fetch(`${CHAT_SERVICE_URL}/api/upload/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uploadId, mapping }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Parse failed');
    }
    
    return response.json();
  }

  async checkScam(text: string): Promise<any> {
    const response = await fetch(`${CHAT_SERVICE_URL}/api/scam/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Scam check failed');
    }
    
    return response.json();
  }

  // WebSocket helper for chat
  createChatWebSocket(convId?: string): WebSocket {
    const wsUrl = CHAT_SERVICE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    return new WebSocket(`${wsUrl}/ws/chat`);
  }

  // Analytics/Revenue data
  async getRevenueTrends(orgId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.request(`/api/orgs/${orgId}/analytics/revenue-trends/?${params.toString()}`);
  }

  async getExpenseAnalysis(orgId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.request(`/api/orgs/${orgId}/analytics/expense-analysis/?${params.toString()}`);
  }

  async getCategoryDistribution(orgId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.request(`/api/orgs/${orgId}/analytics/category-distribution/?${params.toString()}`);
  }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;
