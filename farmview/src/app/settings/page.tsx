"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DebugSettings from "@/components/ui/settings/DebugSettings";
import { TabContainer } from "@/components/ui/tab/TabContainer";

export default function SettingsPage() {
  const [isRunningMigrations, setIsRunningMigrations] = useState(false);
  const [isResettingMigrations, setIsResettingMigrations] = useState(false);
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState("");

  const handleRunMigrations = async () => {
    setIsRunningMigrations(true);
    setMigrationMessage("");
    try {
      const response = await fetch("/api/migrations/run", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setMigrationMessage("✅ Migrations completed successfully!");
      } else {
        setMigrationMessage(`❌ Error: ${data.error || "Failed to run migrations"}`);
      }
    } catch (error) {
      setMigrationMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRunningMigrations(false);
    }
  };

  const handleResetMigrations = async () => {
    if (!confirm("Are you sure you want to reset all migrations? This will delete all data!")) {
      return;
    }
    setIsResettingMigrations(true);
    setMigrationMessage("");
    try {
      const response = await fetch("/api/migrations/reset", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setMigrationMessage("✅ Migrations reset successfully!");
      } else {
        setMigrationMessage(`❌ Error: ${data.error || "Failed to reset migrations"}`);
      }
    } catch (error) {
      setMigrationMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsResettingMigrations(false);
    }
  };

  const handleRunSeeds = async () => {
    setIsSeedingData(true);
    setMigrationMessage("");
    try {
      const response = await fetch("/api/migrations/seed", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setMigrationMessage("✅ Seed data applied successfully!");
      } else {
        setMigrationMessage(`❌ Error: ${data.error || "Failed to run seed data"}`);
      }
    } catch (error) {
      setMigrationMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSeedingData(false);
    }
  };

  const tabs = [
    { id: "connection", label: "Backend Connection", icon: "🔗" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "migrations", label: "Database Migrations", icon: "🗄️" },
    { id: "debug", label: "Debug & Advanced", icon: "🛠️" }
  ];

  const tabContent = {
    connection: (
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
    ),
    appearance: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Appearance Settings</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Customize the visual appearance of your Farm dashboard.
          </p>
        </div>
      </div>
    ),
    migrations: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Database Migrations & Seeds</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Manage database schema migrations and seed data for your Farm Core backend.
          </p>
        </div>

        {/* Migration Actions */}
        <div className="space-y-4">
          <div className="p-4 border border-island_border rounded-theme bg-accent/10">
            <h4 className="font-semibold text-foreground mb-2">Run Migrations</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Apply pending database migrations to update the schema to the latest version.
            </p>
            <button
              onClick={handleRunMigrations}
              disabled={isRunningMigrations || isResettingMigrations || isSeedingData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-theme hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningMigrations ? "Running..." : "Run Migrations"}
            </button>
          </div>

          <div className="p-4 border border-island_border rounded-theme bg-accent/10">
            <h4 className="font-semibold text-foreground mb-2">Seed Development Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Populate the database with development seed data for testing.
            </p>
            <button
              onClick={handleRunSeeds}
              disabled={isRunningMigrations || isResettingMigrations || isSeedingData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-theme hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeedingData ? "Seeding..." : "Run Seeds"}
            </button>
          </div>

          <div className="p-4 border border-red-500/30 rounded-theme bg-red-500/5">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              Reset Migrations (Danger Zone)
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Reset all migrations and drop the database. This will <strong>delete all data</strong> and is irreversible.
            </p>
            <button
              onClick={handleResetMigrations}
              disabled={isRunningMigrations || isResettingMigrations || isSeedingData}
              className="px-4 py-2 bg-red-600 text-white rounded-theme hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResettingMigrations ? "Resetting..." : "Reset Database"}
            </button>
          </div>

          {/* Status Message */}
          {migrationMessage && (
            <div className={`p-4 rounded-theme border ${
              migrationMessage.startsWith("✅") 
                ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400" 
                : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
            }`}>
              {migrationMessage}
            </div>
          )}
        </div>
      </div>
    ),
    debug: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Debug & Advanced Settings</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Advanced configuration options for debugging and troubleshooting.
          </p>
        </div>
        <DebugSettings />
      </div>
    )
  };

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
        <TabContainer
          tabs={tabs}
          defaultTab="connection"
          content={tabContent}
          contentClassName="p-6"
        />
      </div>
    </div>
  );
}
