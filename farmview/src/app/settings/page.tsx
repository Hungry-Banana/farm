"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DebugSettings from "@/components/ui/settings/DebugSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("connection");

  const tabs = [
    { id: "connection", label: "Backend Connection", icon: "🔗" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "debug", label: "Debug & Advanced", icon: "🛠️" }
  ];

  return (
    <div className="container mx-auto max-w-6xl">
      <Breadcrumb />
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure application settings and preferences
            </p>
          </div>
        </div>

        {/* Tabbed Interface */}
        <div className="rounded-theme border border-island_border bg-island_background">
          {/* Tab Navigation */}
          <div className="flex border-b border-island_border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "connection" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Backend Connection Settings</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Configure how the frontend connects to your Farm Core backend service.
                  </p>
                </div>

                {/* Backend URL */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Backend URL
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    The URL of your Farm Core backend server (e.g., http://farm-core:6183)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* API Timeout */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      API Timeout (seconds)
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      How long to wait for API responses before timing out
                    </p>
                  </div>

                  {/* Refresh Interval */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Auto Refresh Interval
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      How often to automatically refresh dashboard data
                    </p>
                  </div>
                </div>

                {/* Connection Status */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Connection Status
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-theme bg-accent/20 border border-island_border">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-foreground">Backend</span>
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 justify-end pt-4 border-t border-island_border">
                  <button
                    className="px-4 py-2 border border-island_border rounded-theme hover:bg-accent/50 transition-colors disabled:opacity-50"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Appearance Settings</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Customize the visual appearance of your Farm dashboard.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "debug" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Debug & Advanced Settings</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Advanced configuration options for debugging and troubleshooting.
                  </p>
                </div>

                <DebugSettings />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
