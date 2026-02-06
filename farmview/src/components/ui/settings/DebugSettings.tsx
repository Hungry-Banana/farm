"use client";

import { useDebug } from '@/contexts/DebugContext';
import { useNotification } from '@/contexts/NotificationContext';

const DebugSettings: React.FC = () => {
  const { settings, updateSetting, toggleAllDebug, isDebugMode } = useDebug();
  const { addNotification } = useNotification();
  
  const handleToggleAll = () => {
    const wasDebugMode = isDebugMode;
    toggleAllDebug();
    
    // Show notification about the change
    addNotification({
      title: wasDebugMode ? 'Debug Mode Disabled' : 'Debug Mode Enabled',
      message: wasDebugMode 
        ? 'All debug features have been turned off.' 
        : 'All debug features are now active. Check search components for additional information.',
      type: wasDebugMode ? 'info' : 'success',
      duration: 3000
    });
  };
  
  const handleSettingChange = (key: keyof typeof settings, value: boolean, settingName: string) => {
    updateSetting(key, value);
    
    // Show notification for individual setting changes
    addNotification({
      title: `${settingName} ${value ? 'Enabled' : 'Disabled'}`,
      message: value 
        ? `${settingName} debug information is now visible.`
        : `${settingName} debug information is now hidden.`,
      type: 'info',
      duration: 2000
    });
  };
  
  return (
    <div className="rounded-theme border border-island_border bg-island_background p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Debug Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control debugging features for troubleshooting and development.
          </p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isDebugMode 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-gray-100 text-gray-600 border border-gray-300'
        }`}>
          {isDebugMode ? '🐛 DEBUG ACTIVE' : 'DEBUG OFF'}
        </div>
      </div>

      {/* Master Toggle */}
      <div className="flex items-center justify-between py-3 mb-4 border-b border-island_border">
        <div>
          <h3 className="font-medium text-foreground">Master Debug Toggle</h3>
          <p className="text-sm text-muted-foreground">
            Enable or disable all debug features at once
          </p>
        </div>
        <button
          onClick={handleToggleAll}
          className={`px-4 py-2 rounded-theme font-medium transition-colors ${
            isDebugMode
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          {isDebugMode ? 'Disable All Debug' : 'Enable All Debug'}
        </button>
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        <DebugSettingRow
          title="Search JSON"
          description="Display structured JSON sent to backend"
          checked={settings.showSearchJSON}
          onChange={(checked) => handleSettingChange('showSearchJSON', checked, 'Search JSON')}
        />
        
        <DebugSettingRow
          title="API Responses"
          description="Log API responses to browser console"
          checked={settings.showAPIResponses}
          onChange={(checked) => handleSettingChange('showAPIResponses', checked, 'API Responses')}
        />
        
        <DebugSettingRow
          title="Performance Metrics"
          description="Show performance timing information"
          checked={settings.showPerformanceMetrics}
          onChange={(checked) => handleSettingChange('showPerformanceMetrics', checked, 'Performance Metrics')}
        />
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-island_border">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 Debug settings persist across browser sessions</p>
          <p>📍 Environment: {process.env.NODE_ENV} | Storage: localStorage</p>
        </div>
      </div>
    </div>
  );
};

interface DebugSettingRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  recommended?: boolean;
}

const DebugSettingRow: React.FC<DebugSettingRowProps> = ({
  title,
  description,
  checked,
  onChange,
  recommended = false
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-island_border last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground">{title}</h4>
          {recommended && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-full">
              ⭐
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      
      <div className="ml-4 flex-shrink-0">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-11 h-6 rounded-full transition-colors ${
            checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0'
            } mt-0.5 ml-0.5`} />
          </div>
        </label>
      </div>
    </div>
  );
};

export default DebugSettings;