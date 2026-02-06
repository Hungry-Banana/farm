"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_DATA } from "./data/index"; // Adjust import path
import { ChevronUp } from "@/assets/icons"; // Adjust import path

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  // Automatically set active menu based on current route
  useEffect(() => {
    for (const section of NAV_DATA) {
      for (const menu of section.items) {
        if ('items' in menu && menu.items) {
          // Check if any submenu item matches the current path
          const hasActiveSubItem = menu.items.some(subItem => {
            // Check nested submenu items
            if ('items' in subItem && subItem.items) {
              const hasActiveNestedItem = subItem.items.some(nestedItem => {
                if (pathname === nestedItem.url) return true;
                if (nestedItem.url && nestedItem.url !== "/" && pathname.startsWith(nestedItem.url + "/")) {
                  return true;
                }
                return false;
              });
              
              if (hasActiveNestedItem) {
                setActiveSubmenu(subItem.title);
                return true;
              }
            }
            
            // Check regular submenu items
            if (pathname === subItem.url) return true;
            if (subItem.url && subItem.url !== "/" && subItem.url !== "/servers" && pathname.startsWith(subItem.url + "/")) {
              return true;
            }
            return false;
          });
          
          if (hasActiveSubItem) {
            setActiveMenu(menu.title);
            return;
          }
        }
      }
    }
  }, [pathname]);

  const toggleMenu = (menu: string) => {
    setActiveMenu((prev) => (prev === menu ? null : menu)); // Toggle active menu
  };

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu((prev) => (prev === submenu ? null : submenu)); // Toggle active submenu
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActiveRoute = (url: string, allUrls?: string[]) => {
    // Exact match is always active
    if (pathname === url) {
      return true;
    }
    
    // Special handling for /databases - don't match if we're in a migration route
    if (url === '/databases' && pathname.startsWith('/databases/migrations')) {
      return false;
    }
    
    // Special handling for /servers - don't match if we're in a VM route
    if (url === '/servers' && pathname.startsWith('/servers/vms')) {
      return false;
    }
    
    // If we have a list of all URLs in this menu, we can be more precise
    if (allUrls) {
      // Don't match parent routes if there's a more specific child route that could match
      const moreSpecificMatch = allUrls.find(otherUrl => 
        otherUrl && // Add null check
        otherUrl !== url && 
        otherUrl.startsWith(url) && 
        pathname.startsWith(otherUrl)
      );
      
      if (moreSpecificMatch) {
        return false; // Don't highlight this route, there's a more specific one
      }
    }
    
    // For nested routes, only match if it's a true parent-child relationship
    // But avoid matching broad parent paths when more specific paths exist
    if (url !== "/" && pathname.startsWith(url + "/")) {
      // Additional check: if this is a broad path like /databases, 
      // don't match if there are migration-specific routes
      if (url === '/databases' && pathname.includes('/migrations')) {
        return false;
      }
      // Additional check: if this is a broad path like /servers,
      // don't match if there are VM-specific routes
      if (url === '/servers' && pathname.includes('/vms')) {
        return false;
      }
      return true;
    }
    
    return false;
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 h-full transition-all duration-300 ease-in-out z-50 
        border-r border-island_border bg-island_background backdrop-blur-sm
        ${isCollapsed ? 'w-16' : 'w-[290px]'} -translate-x-full lg:translate-x-0`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-island_border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-theme bg-amber-950/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌱</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Farm</h2>
              <p className="text-sm text-muted-foreground">Management</p>
            </div>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-theme hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="space-y-6">
          {NAV_DATA.map((section) => (
            <div key={section.label}>
              {!isCollapsed && (
                <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-3 px-2">
                  {section.label}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((menu) => (
                  <div key={menu.title}>
                    {/* Main Menu Item */}
                    <div
                      className={`group relative flex items-center cursor-pointer rounded-theme focus:outline-none
                        transition-all duration-200 ${isCollapsed ? 'p-1 justify-center' : 'p-3 justify-between'}
                        ${activeMenu === menu.title && !isCollapsed
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : activeMenu === menu.title && isCollapsed
                          ? "" // No background/border for collapsed active state - handled on icon
                          : isCollapsed
                          ? "text-foreground border border-transparent" // No hover background when collapsed - handled on icon
                          : "hover:bg-accent text-foreground hover:text-foreground border border-transparent"
                        }`}
                      onClick={() => {
                        if ('items' in menu && menu.items) {
                          toggleMenu(menu.title);
                        } else if ('url' in menu && menu.url) {
                          // Handle direct navigation
                          window.location.href = menu.url;
                        }
                      }}
                    >
                      {isCollapsed ? (
                        // Collapsed state - center icon with conditional wrapper
                        <div className={`transition-all duration-200 ${
                          activeMenu === menu.title 
                            ? 'p-2 bg-primary/10 border border-primary/30 rounded-theme' 
                            : 'p-2 hover:bg-accent rounded-theme'
                        }`}>
                          {menu.icon && (
                            <menu.icon className={`flex-shrink-0 transition-colors w-6 h-6 ${
                              activeMenu === menu.title ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                            }`} />
                          )}
                        </div>
                      ) : (
                        // Expanded state - original layout
                        <>
                          <div className="flex items-center space-x-3">
                            {menu.icon && (
                              <menu.icon className={`flex-shrink-0 transition-colors w-5 h-5 ${
                                activeMenu === menu.title ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                              }`} />
                            )}
                            <span className="font-medium truncate">{menu.title}</span>
                          </div>
                          {('items' in menu && menu.items) && (
                            <ChevronUp
                              className={`w-4 h-4 flex-shrink-0 transition-all duration-200 text-muted-foreground group-hover:text-foreground ${
                                activeMenu === menu.title ? "rotate-180 text-primary" : "rotate-0"
                              }`}
                            />
                          )}
                        </>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-theme 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                          {menu.title}
                        </div>
                      )}
                    </div>

                    {/* Submenu Items */}
                    {('items' in menu && menu.items) && activeMenu === menu.title && !isCollapsed && (
                      <div className="mt-2 ml-6 space-y-1 border-l-2 border-island_border pl-4">
                        {menu.items.map((subItem) => {
                          // Handle nested submenus (like Migrations under Databases)
                          if ('items' in subItem && subItem.items) {
                            return (
                              <div key={subItem.title} className="space-y-1">
                                {/* Nested submenu header - clickable dropdown */}
                                <div
                                  className={`flex items-center justify-between p-2.5 text-sm font-medium rounded-theme cursor-pointer transition-all duration-200 ${
                                    activeSubmenu === subItem.title 
                                      ? "bg-accent text-foreground" 
                                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                  }`}
                                  onClick={() => toggleSubmenu(subItem.title)}
                                >
                                  <div className="flex items-center">
                                    {subItem.icon && <subItem.icon className="w-4 h-4 mr-2" />}
                                    {subItem.title}
                                  </div>
                                  <ChevronUp
                                    className={`w-3 h-3 transition-all duration-200 ${
                                      activeSubmenu === subItem.title ? "rotate-180" : "rotate-0"
                                    }`}
                                  />
                                </div>
                                
                                {/* Nested submenu items - only show if active */}
                                {activeSubmenu === subItem.title && (
                                  <div className="ml-4 space-y-1">
                                    {subItem.items.map((nestedItem) => {
                                      if (!nestedItem.url) return null;
                                      return (
                                        <Link key={nestedItem.url} href={nestedItem.url}>
                                          <div
                                            className={`block p-2 rounded-theme transition-all duration-200 text-sm ${
                                              pathname === nestedItem.url
                                                ? "bg-primary text-white shadow-sm" 
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                            }`}
                                          >
                                            {nestedItem.title}
                                          </div>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          
                          // Handle regular submenu items with URLs
                          if (!subItem.url) return null;
                          const allSubmenuUrls = menu.items!.filter(item => item.url).map(item => item.url!);
                          return (
                            <Link key={subItem.url} href={subItem.url}>
                              <div
                                className={`block p-2.5 rounded-theme transition-all duration-200 text-sm ${
                                  isActiveRoute(subItem.url, allSubmenuUrls)
                                    ? "bg-primary text-white shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                }`}
                              >
                                {subItem.title}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-island_border">
          <div className="flex items-center space-x-3 p-3 rounded-theme bg-accent/50">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">User</p>
              <p className="text-xs text-muted-foreground truncate">Administrator</p>
            </div>
            <button className="p-1 rounded-theme hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
