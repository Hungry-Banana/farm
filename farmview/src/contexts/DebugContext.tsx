/**
 * Debug settings context for controlling debug features across the app
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import notification context if it exists, otherwise define a dummy hook
let useNotification: any;
try {
  useNotification = require('./NotificationContext').useNotification;
} catch {
  useNotification = () => ({ addNotification: () => {} });
}

interface DebugSettings {
  showSearchPreview: boolean;
  showSearchJSON: boolean;
  showOriginalCriteria: boolean;
  showLogicWarnings: boolean;
  showAPIResponses: boolean;
  showPerformanceMetrics: boolean;
}

interface DebugContextType {
  settings: DebugSettings;
  updateSetting: (key: keyof DebugSettings, value: boolean) => void;
  toggleAllDebug: () => void;
  isDebugMode: boolean;
}

const defaultSettings: DebugSettings = {
  showSearchPreview: false,
  showSearchJSON: false,
  showOriginalCriteria: false,
  showLogicWarnings: true, // Keep warnings on by default for UX
  showAPIResponses: false,
  showPerformanceMetrics: false,
};

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DebugSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('farm-debug-settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.warn('Failed to parse debug settings from localStorage:', error);
        }
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('farm-debug-settings', JSON.stringify(settings));
    }
  }, [settings]);

  const updateSetting = (key: keyof DebugSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleAllDebug = () => {
    const anyEnabled = Object.entries(settings).some(([key, value]) => 
      key !== 'showLogicWarnings' && value === true
    );
    
    setSettings(prev => ({
      ...prev,
      showSearchPreview: !anyEnabled,
      showSearchJSON: !anyEnabled,
      showOriginalCriteria: !anyEnabled,
      showAPIResponses: !anyEnabled,
      showPerformanceMetrics: !anyEnabled,
      // Keep logic warnings as-is since they're UX-related
    }));
  };

  const isDebugMode = Object.entries(settings).some(([key, value]) => 
    key !== 'showLogicWarnings' && value === true
  );

  return (
    <DebugContext.Provider value={{
      settings,
      updateSetting,
      toggleAllDebug,
      isDebugMode
    }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}

// Hook for checking if debug mode should be shown (checks for dev environment too)
export function useShowDebug() {
  const { isDebugMode } = useDebug();
  const isDev = process.env.NODE_ENV === 'development';
  return isDev || isDebugMode;
}