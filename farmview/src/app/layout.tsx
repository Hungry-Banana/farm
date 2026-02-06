"use client";

import "@/styles/globals.css";
import Sidebar from "@/components/common/Layouts/sidebar/Sidebar";
import NotificationContainer from "@/components/ui/Notifications/NotificationContainer";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { DebugProvider } from "@/contexts/DebugContext";
import { useState } from "react";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          <DebugProvider>
            <div className="min-h-screen xl:flex bg-background text-foreground overflow-y custom-scrollbar">
              {/* Sidebar */}
              <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                setIsCollapsed={setIsSidebarCollapsed} 
              />

              {/* Main Content Area */}
              <div className={`flex-1 duration-300 ease-in-out overflow-hidden transition-all
                ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-[290px]'}`}>

                {/* Main Content - Takes Remaining Space */}
                <div className="p-10 mx-auto w-full min-w-0 overflow-y-auto custom-scrollbar max-w-full">  
                  {children}
                </div>
              </div>
            </div>

            {/* Notification Container - Shows Toast Notifications */}
            <NotificationContainer />
          </DebugProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}