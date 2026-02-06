// Central configuration file for FarmUI
// This file contains all shared constants and configuration values

// API Configuration
export const API_CONFIG = {
  // Request Configuration
  TIMEOUTS: {
    DEFAULT: 15000,
    GRAFANA: 30000,
    MIGRATIONS: 120000, // 2 minutes for complex migrations
  },
} as const;

// Common headers
export const HEADERS = {
  JSON: {
    'Content-Type': 'application/json',
  },
  
  FARM_CORE: {
    'Content-Type': 'application/json',
    'User-Agent': 'Farm-Dashboard/1.0',
  }
} as const;