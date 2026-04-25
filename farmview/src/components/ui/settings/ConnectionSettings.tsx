"use client";

import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

interface ConnectionStatus {
  state: 'idle' | 'checking' | 'healthy' | 'degraded' | 'unreachable' | 'unconfigured';
  latency?: number;
  dbStatus?: string;
  dbResponseTimeMs?: number;
  backendUrl?: string;
  error?: string;
  lastChecked?: Date;
}

interface ConnectionPrefs {
  timeoutSecs: number;
  refreshSecs: number;
}

const STORAGE_KEY = 'farm-connection-prefs';
const DEFAULT_PREFS: ConnectionPrefs = { timeoutSecs: 15, refreshSecs: 30 };

const STATUS_CONFIG = {
  idle:          { label: 'Not Checked',    dotClass: 'bg-gray-400',                    textClass: 'text-muted-foreground' },
  checking:      { label: 'Checking...',    dotClass: 'bg-sky-400 animate-pulse',        textClass: 'text-sky-400' },
  healthy:       { label: 'Healthy',        dotClass: 'bg-emerald-400',                  textClass: 'text-emerald-400' },
  degraded:      { label: 'Degraded',       dotClass: 'bg-yellow-400',                   textClass: 'text-yellow-400' },
  unreachable:   { label: 'Unreachable',    dotClass: 'bg-red-400',                      textClass: 'text-red-400' },
  unconfigured:  { label: 'Not Configured', dotClass: 'bg-orange-400',                   textClass: 'text-orange-400' },
} as const;

export default function ConnectionSettings() {
  const { addNotification } = useNotification();
  const [status, setStatus] = useState<ConnectionStatus>({ state: 'idle' });
  const [prefs, setPrefs] = useState<ConnectionPrefs>(DEFAULT_PREFS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
      } catch { /* ignore */ }
    }
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, state: 'checking' }));
    try {
      const res = await fetch('/api/health');
      const data = await res.json();

      if (res.ok && (data.status === 'healthy' || data.status === 'degraded')) {
        setStatus({
          state: data.status === 'healthy' ? 'healthy' : 'degraded',
          latency: data.latency_ms,
          dbStatus: data.checks?.database,
          dbResponseTimeMs: data.details?.database?.response_time_ms,
          backendUrl: data.backend_url,
          lastChecked: new Date(),
        });
      } else {
        setStatus({
          state: data.status === 'unconfigured' ? 'unconfigured' : 'unreachable',
          error: data.error,
          backendUrl: data.backend_url,
          lastChecked: new Date(),
        });
      }
    } catch {
      setStatus({ state: 'unreachable', error: 'Network error', lastChecked: new Date() });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setDirty(false);
    addNotification({ title: 'Settings Saved', message: 'Connection preferences updated.', type: 'success', duration: 2000 });
  };

  const handleReset = () => {
    setPrefs(DEFAULT_PREFS);
    localStorage.removeItem(STORAGE_KEY);
    setDirty(false);
    addNotification({ title: 'Settings Reset', message: 'Connection preferences reset to defaults.', type: 'info', duration: 2000 });
  };

  const { label, dotClass, textClass } = STATUS_CONFIG[status.state];

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <div className="rounded-theme border border-island_border bg-island_background p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Connection Status</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Live status of the Farm Core backend</p>
          </div>
          <button
            onClick={checkConnection}
            disabled={status.state === 'checking'}
            className="text-xs px-3 py-1.5 rounded-theme border border-island_border hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status.state === 'checking' ? 'Checking...' : 'Test Connection'}
          </button>
        </div>

        <div className="space-y-2">
          {/* API row */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-theme bg-accent/20">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
              <span className="text-sm font-medium text-foreground">Farm Core API</span>
            </div>
            <div className="flex items-center gap-3">
              {status.latency !== undefined && (
                <span className="text-xs text-muted-foreground">{status.latency}ms</span>
              )}
              <span className={`text-xs font-semibold ${textClass}`}>{label}</span>
            </div>
          </div>

          {/* Database row — shown once we have a response */}
          {(status.state === 'healthy' || status.state === 'degraded') && (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-theme bg-accent/20">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  status.dbStatus === 'ok' ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                <span className="text-sm font-medium text-foreground">Database</span>
              </div>
              <div className="flex items-center gap-3">
                {status.dbResponseTimeMs !== undefined && (
                  <span className="text-xs text-muted-foreground">{status.dbResponseTimeMs}ms</span>
                )}
                <span className={`text-xs font-semibold ${
                  status.dbStatus === 'ok' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {status.dbStatus === 'ok' ? 'Connected' : 'Error'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-3 space-y-1 pl-1">
          {status.backendUrl && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">URL: </span>
              <code className="font-mono">{status.backendUrl}</code>
            </p>
          )}
          {status.error && (
            <p className="text-xs text-red-400">{status.error}</p>
          )}
          {status.lastChecked && (
            <p className="text-xs text-muted-foreground">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* API Preferences */}
      <div className="rounded-theme border border-island_border bg-island_background p-5">
        <h3 className="font-semibold text-foreground mb-1">API Preferences</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These settings are stored in your browser and used by the dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Request Timeout
              <span className="ml-1 font-normal text-muted-foreground">(seconds)</span>
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={prefs.timeoutSecs}
              onChange={(e) => {
                setPrefs(p => ({ ...p, timeoutSecs: Math.max(5, parseInt(e.target.value) || 15) }));
                setDirty(true);
              }}
              className="w-full px-3 py-2 rounded-theme border border-island_border bg-island_background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm [color-scheme:dark]"
            />
            <p className="text-xs text-muted-foreground mt-1">How long before API requests time out (5–120s)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Auto-Refresh Interval
              <span className="ml-1 font-normal text-muted-foreground">(seconds)</span>
            </label>
            <input
              type="number"
              min={10}
              max={300}
              value={prefs.refreshSecs}
              onChange={(e) => {
                setPrefs(p => ({ ...p, refreshSecs: Math.max(10, parseInt(e.target.value) || 30) }));
                setDirty(true);
              }}
              className="w-full px-3 py-2 rounded-theme border border-island_border bg-island_background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm [color-scheme:dark]"
            />
            <p className="text-xs text-muted-foreground mt-1">How often dashboard data auto-refreshes (10–300s)</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm border border-island_border rounded-theme hover:bg-accent/50 transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="px-4 py-2 text-sm bg-primary text-white rounded-theme hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
