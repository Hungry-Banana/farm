"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Breadcrumb = ({ header }: { header?: string }) => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment); // Remove empty segments

  // Format segment names for better display
  const formatSegmentName = (segment: string) => {
    // Handle special cases
    if (segment.match(/^\d+$/)) return `ID: ${segment}`; // If it's just numbers, add "ID:"
    
    // Convert kebab-case or snake_case to Title Case
    return segment
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-4 rounded-theme border border-island_border bg-island_background">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
            {header || (pathSegments.length > 0
              ? formatSegmentName(pathSegments[pathSegments.length - 1])
              : "Dashboard")}
          </h1>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex-shrink-0">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home Link */}
          <li>
            <Link 
              className="flex items-center gap-1.5 px-3 py-2 rounded-theme text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors" 
              href="/"
            >
              <span className="text-base">🏠</span>
              <span className="font-medium">Home</span>
            </Link>
          </li>
          
          {pathSegments.length > 0 && (
            <li className="text-muted-foreground/50">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </li>
          )}
          
          {/* Path Segments */}
          {pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");
            const isLast = index === pathSegments.length - 1;

            return (
              <li key={href} className="flex items-center gap-2">
                {isLast ? (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-theme bg-primary/10 text-primary">
                    <span className="font-medium">{formatSegmentName(segment)}</span>
                  </div>
                ) : (
                  <>
                    <Link 
                      className="flex items-center gap-1.5 px-3 py-2 rounded-theme text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors" 
                      href={href}
                    >
                      <span className="font-medium">{formatSegmentName(segment)}</span>
                    </Link>
                    <div className="text-muted-foreground/50">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
