"use client";

import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

const COLOR_THEMES = [
  { id: 'sky',     name: 'Sky',     hex: '#0ea5e9' },
  { id: 'violet',  name: 'Violet',  hex: '#8b5cf6' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
  { id: 'amber',   name: 'Amber',   hex: '#f59e0b' },
  { id: 'rose',    name: 'Rose',    hex: '#f43f5e' },
  { id: 'cyan',    name: 'Cyan',    hex: '#06b6d4' },
] as const;

const RADIUS_OPTIONS = [
  { id: 'sharp',   name: 'Sharp',   value: '0px',     preview: '0%' },
  { id: 'subtle',  name: 'Subtle',  value: '0.1rem',  preview: '10%' },
  { id: 'rounded', name: 'Rounded', value: '0.375rem', preview: '40%' },
  { id: 'pill',    name: 'Pill',    value: '0.75rem', preview: '50%' },
] as const;

const DENSITY_OPTIONS = [
  { id: 'compact', name: 'Compact', borderAlpha: '0.20', bgAlpha: '0.02' },
  { id: 'normal',  name: 'Normal',  borderAlpha: '0.35', bgAlpha: '0.03' },
  { id: 'airy',    name: 'Airy',    borderAlpha: '0.50', bgAlpha: '0.07' },
] as const;

type ColorThemeId  = typeof COLOR_THEMES[number]['id'];
type RadiusId      = typeof RADIUS_OPTIONS[number]['id'];
type DensityId     = typeof DENSITY_OPTIONS[number]['id'];

interface AppearancePrefs {
  colorTheme: ColorThemeId;
  radius: RadiusId;
  density: DensityId;
}

const STORAGE_KEY = 'farm-appearance-prefs';
const DEFAULT_PREFS: AppearancePrefs = { colorTheme: 'sky', radius: 'subtle', density: 'normal' };

function hexToRgb(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`
    : '14, 165, 233';
}

function applyTheme(prefs: AppearancePrefs) {
  const color   = COLOR_THEMES.find(t => t.id === prefs.colorTheme) ?? COLOR_THEMES[0];
  const radius  = RADIUS_OPTIONS.find(r => r.id === prefs.radius)   ?? RADIUS_OPTIONS[1];
  const density = DENSITY_OPTIONS.find(d => d.id === prefs.density) ?? DENSITY_OPTIONS[1];
  const rgb     = hexToRgb(color.hex);
  const root    = document.documentElement;

  root.style.setProperty('--primary', color.hex);
  root.style.setProperty('--island-border', `rgba(${rgb}, ${density.borderAlpha})`);
  root.style.setProperty('--island-background', `rgba(${rgb}, ${density.bgAlpha})`);
  root.style.setProperty('--rounded', radius.value);
}

export default function AppearanceSettings() {
  const { addNotification } = useNotification();
  const [prefs, setPrefs] = useState<AppearancePrefs>(DEFAULT_PREFS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = { ...DEFAULT_PREFS, ...JSON.parse(stored) } as AppearancePrefs;
        setPrefs(parsed);
        applyTheme(parsed);
      } catch { /* ignore */ }
    }
  }, []);

  const updatePref = <K extends keyof AppearancePrefs>(key: K, value: AppearancePrefs[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setDirty(true);
    applyTheme(updated);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setDirty(false);
    addNotification({ title: 'Appearance Saved', message: 'Theme preferences applied.', type: 'success', duration: 2000 });
  };

  const handleReset = () => {
    setPrefs(DEFAULT_PREFS);
    localStorage.removeItem(STORAGE_KEY);
    applyTheme(DEFAULT_PREFS);
    setDirty(false);
    addNotification({ title: 'Appearance Reset', message: 'Theme reset to defaults.', type: 'info', duration: 2000 });
  };

  return (
    <div className="space-y-6">
      {/* Accent Color */}
      <div className="rounded-theme border border-island_border bg-island_background p-5">
        <h3 className="font-semibold text-foreground mb-1">Accent Color</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sets the primary color used for buttons, highlights, and borders.
        </p>
        <div className="flex flex-wrap gap-2">
          {COLOR_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => updatePref('colorTheme', theme.id)}
              title={theme.name}
              className={`flex items-center gap-2 px-3 py-2 rounded-theme border text-sm transition-all ${
                prefs.colorTheme === theme.id
                  ? 'border-white/50 bg-white/5 text-foreground scale-105'
                  : 'border-island_border text-muted-foreground hover:text-foreground hover:border-white/20'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-white/20"
                style={{ backgroundColor: theme.hex }}
              />
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="rounded-theme border border-island_border bg-island_background p-5">
        <h3 className="font-semibold text-foreground mb-1">Border Radius</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Controls the roundness of cards, buttons, inputs, and other elements.
        </p>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => updatePref('radius', opt.id)}
              className={`px-4 py-2 text-sm border transition-colors ${
                prefs.radius === opt.id
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-island_border text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
              style={{ borderRadius: opt.value }}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Card Density */}
      <div className="rounded-theme border border-island_border bg-island_background p-5">
        <h3 className="font-semibold text-foreground mb-1">Card Density</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adjusts the visual weight of card borders and island backgrounds.
        </p>
        <div className="flex flex-wrap gap-2">
          {DENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => updatePref('density', opt.id)}
              className={`px-4 py-2 text-sm rounded-theme border transition-colors ${
                prefs.density === opt.id
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-island_border text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-theme border border-island_border bg-island_background p-5">
        <h3 className="font-semibold text-foreground mb-3">Live Preview</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2 text-sm rounded-theme bg-primary text-white">
            Primary Button
          </button>
          <button className="px-4 py-2 text-sm rounded-theme border border-island_border text-foreground hover:bg-accent/50 transition-colors">
            Outline Button
          </button>
          <div className="px-3 py-1.5 text-xs rounded-theme border border-island_border bg-island_background text-muted-foreground">
            Card Element
          </div>
          <input
            readOnly
            value="Input field"
            className="px-3 py-2 text-sm rounded-theme border border-island_border bg-accent/10 text-foreground w-32"
          />
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
