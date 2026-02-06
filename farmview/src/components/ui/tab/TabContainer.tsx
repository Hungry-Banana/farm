"use client";

import { useState, ReactNode } from "react";

export interface TabDefinition {
  id: string;
  label: string;
  icon?: string;
}

interface TabContainerProps {
  tabs: TabDefinition[];
  defaultTab?: string;
  content: Record<string, ReactNode>;
  className?: string;
  contentClassName?: string;
  tabNavClassName?: string;
}

export function TabContainer({
  tabs,
  defaultTab,
  content,
  className = "",
  contentClassName = "",
  tabNavClassName = ""
}: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

  return (
    <div className={`rounded-theme border border-island_border bg-island_background ${className}`}>
      {/* Tab Navigation */}
      <div className={`flex border-b border-island_border overflow-x-auto ${tabNavClassName}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={contentClassName}>
        {content[activeTab] || (
          <div className="text-center py-12 text-muted-foreground">
            <p>No content available for this tab</p>
          </div>
        )}
      </div>
    </div>
  );
}