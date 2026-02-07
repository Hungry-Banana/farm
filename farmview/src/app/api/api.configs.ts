import "server-only";

export const API_CONFIG = {
  // Backend API URLs
  FARMCORE: {
    URL: process.env.FARM_CORE_API_URL,
  },
  
  // Grafana Configuration
  GRAFANA: {
    URL: process.env.GRAFANA_URL,
    TOKEN: process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN,
  },
  
  // Request Configuration
  TIMEOUTS: {
    DEFAULT: 15000,
    GRAFANA: 30000,
  },
} as const;