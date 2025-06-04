const API_BASE_URL = "http://localhost:8000";

export const API_ENDPOINTS = {
  // Payment endpoints
  PAYMENT: {
    CREATE: `${API_BASE_URL}/v1/payments/create`,
    HISTORY: `${API_BASE_URL}/v1/payments/history`,
    STATUS: `${API_BASE_URL}/v1/payments/status`,
    STATS: `${API_BASE_URL}/v1/payments/stats`,
    MOMO: {
      CALLBACK: `${API_BASE_URL}/v1/payments/momo/callback`,
      IPN: `${API_BASE_URL}/v1/payments/momo/ipn`,
    },
    VNPAY: {
      CALLBACK: `${API_BASE_URL}/v1/payments/vnpay/callback`,
      IPN: `${API_BASE_URL}/v1/payments/vnpay/ipn`,
    },
  },
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/v1/auth/login`,
    REGISTER: `${API_BASE_URL}/v1/auth/register`,
    REFRESH: `${API_BASE_URL}/v1/auth/refresh`,
  },
  // User endpoints
  USER: {
    PROFILE: `${API_BASE_URL}/v1/users/profile`,
    UPDATE: `${API_BASE_URL}/v1/users/update`,
  },
};

export default API_ENDPOINTS;
