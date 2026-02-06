import React from "react";

export function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g clipPath="url(#clip0_settings)">
        <path d="M20 7h-9"></path>
        <path d="M14 17H5"></path>
        <circle cx="17" cy="17" r="3"></circle>
        <circle cx="7" cy="7" r="3"></circle>
      </g>
      <defs>
        <clipPath id="clip0_settings">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function UpArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12l7-7 7 7"></path>
      <path d="M12 19V5"></path>
    </svg>
  );
}

export function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props} // ✅ Allows passing dynamic props (size, color, etc.)
    >
      <path d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366" />
    </svg>
  );
}

export function DefaultSortIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 15l5 5 5-5"></path>
      <path d="M7 9l5-5 5 5"></path>
    </svg>
  );
}
export function DefaultServerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      width="24"
      height="24"
      {...props}
    >
      <rect x="2" y="3" width="20" height="8" rx="2" />
      <rect x="2" y="13" width="20" height="8" rx="2" />
      <path d="M6 8h.01" />
      <path d="M6 18h.01" />
    </svg>
  );
}

export function NetworkingDeviceIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
       <rect x="2" y="13" width="20" height="8" rx="2" />

        <circle cx="7" cy="17" r="1" />
        <circle cx="12" cy="17" r="1" />
        <circle cx="17" cy="17" r="1" />

        <path d="M4 8c4-4 12-4 16 0" />
        <path d="M7 11c3-3 8-3 11 0" />
        <path d="M10 14c2-2 4-2 6 0" />
    </svg>
  );
}

export function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Top Cylinder */}
      <ellipse cx="12" cy="5" rx="7" ry="3" />

      {/* Middle Layer */}
      <path d="M5 10c0 1.66 3.13 3 7 3s7-1.34 7-3" />

      {/* Bottom Layer */}
      <path d="M5 15c0 1.66 3.13 3 7 3s7-1.34 7-3" />

      {/* Side Lines to Connect Layers */}
      <line x1="5" y1="5" x2="5" y2="15" />
      <line x1="19" y1="5" x2="19" y2="15" />
    </svg>
  );
}

export function KubernetesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Hexagon Outer Shape */}
      <polygon points="12 2 20 7 20 17 12 22 4 17 4 7" />

      {/* Center Circle */}
      <circle cx="12" cy="12" r="2" />

      {/* Hexagon Inner Lines */}
      <line x1="12" y1="4" x2="12" y2="10" />
      <line x1="18" y1="8" x2="13.5" y2="12" />
      <line x1="18" y1="16" x2="13.5" y2="12" />
      <line x1="12" y1="20" x2="12" y2="14" />
      <line x1="6" y1="16" x2="10.5" y2="12" />
      <line x1="6" y1="8" x2="10.5" y2="12" />
    </svg>
  );
}

export function Sun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M10 1.042c.345 0 .625.28.625.625V2.5a.625.625 0 11-1.25 0v-.833c0-.346.28-.625.625-.625zM3.666 3.665a.625.625 0 01.883 0l.328.328a.625.625 0 01-.884.884l-.327-.328a.625.625 0 010-.884zm12.668 0a.625.625 0 010 .884l-.327.328a.625.625 0 01-.884-.884l.327-.327a.625.625 0 01.884 0zM10 5.626a4.375 4.375 0 100 8.75 4.375 4.375 0 000-8.75zM4.375 10a5.625 5.625 0 1111.25 0 5.625 5.625 0 01-11.25 0zm-3.333 0c0-.345.28-.625.625-.625H2.5a.625.625 0 110 1.25h-.833A.625.625 0 011.042 10zm15.833 0c0-.345.28-.625.625-.625h.833a.625.625 0 010 1.25H17.5a.625.625 0 01-.625-.625zm-1.752 5.123a.625.625 0 01.884 0l.327.327a.625.625 0 11-.884.884l-.327-.327a.625.625 0 010-.884zm-10.246 0a.625.625 0 010 .884l-.328.327a.625.625 0 11-.883-.884l.327-.327a.625.625 0 01.884 0zM10 16.875c.345 0 .625.28.625.625v.833a.625.625 0 01-1.25 0V17.5c0-.345.28-.625.625-.625z" />
    </svg>
  );
}

export function Moon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.18 2.334a7.71 7.71 0 108.485 8.485A6.042 6.042 0 119.18 2.335zM1.042 10a8.958 8.958 0 018.958-8.958c.598 0 .896.476.948.855.049.364-.086.828-.505 1.082a4.792 4.792 0 106.579 6.579c.253-.42.717-.555 1.081-.506.38.052.856.35.856.948A8.958 8.958 0 011.04 10z"
      />
    </svg>
  );
}

export function ChevronUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={8}
      viewBox="0 0 16 8"
      fill="currentColor"
      {...props} // Spread props to allow size, color, etc.
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.553.728a.687.687 0 01.895 0l6.416 5.5a.688.688 0 01-.895 1.044L8 2.155 2.03 7.272a.688.688 0 11-.894-1.044l6.417-5.5z"
      />
    </svg>
  );
}

export function BarnIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props} // Spread props to allow size, color, etc.
    >
      {/* Barn Structure */}
      <path d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-4v-5a2 2 0 00-2-2h-4a2 2 0 00-2 2v5H4a1 1 0 01-1-1V10zM12 3.8L5 9v10h3v-4a3 3 0 013-3h4a3 3 0 013 3v4h3V9l-7-5.2z" />

      {/* Barn Doors */}
      <rect x="9" y="15" width="6" height="5" fill="currentColor" />

      {/* Window */}
      <rect x="11" y="7" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

export function DashBoardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props} // Spread props to allow size, color, etc.
    >
      <path
        fillRule="evenodd"
        d="M5.5 3.25A2.25 2.25 0 0 0 3.25 5.5V9a2.25 2.25 0 0 0 2.25 2.25H9A2.25 2.25 0 0 0 11.25 9V5.5A2.25 2.25 0 0 0 9 3.25zM4.75 5.5a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75V9a.75.75 0 0 1-.75.75H5.5A.75.75 0 0 1 4.75 9zm.75 7.25A2.25 2.25 0 0 0 3.25 15v3.5a2.25 2.25 0 0 0 2.25 2.25H9a2.25 2.25 0 0 0 2.25-2.25V15A2.25 2.25 0 0 0 9 12.75zM4.75 15a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H5.5a.75.75 0 0 1-.75-.75zm8-9.5A2.25 2.25 0 0 1 15 3.25h3.5a2.25 2.25 0 0 1 2.25 2.25V9a2.25 2.25 0 0 1-2.25 2.25H15A2.25 2.25 0 0 1 12.75 9zM15 4.75a.75.75 0 0 0-.75.75V9c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75V5.5a.75.75 0 0 0-.75-.75zm0 8A2.25 2.25 0 0 0 12.75 15v3.5A2.25 2.25 0 0 0 15 20.75h3.5a2.25 2.25 0 0 0 2.25-2.25V15a2.25 2.25 0 0 0-2.25-2.25zM14.25 15a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75z"
      />
    </svg>
  );
}

export function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props} // Allows customization via props (size, color, etc.)
    >
      <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="currentColor"
      {...props} // ✅ Allows passing dynamic props (size, color, etc.)
    >
      <defs>
        {/* ✅ Linear Gradient Definition (if needed) */}
        <linearGradient id="paint0_linear_2816_28044" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFA500" />
          <stop offset="1" stopColor="#FF8C00" />
        </linearGradient>
      </defs>

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.3986 4.40674C12.9265 3.77722 12.1855 3.40674 11.3986 3.40674H2.5C1.11929 3.40674 0 4.52602 0 5.90674V30.0959C0 31.4766 1.11929 32.5959 2.5 32.5959H33.5C34.8807 32.5959 36 31.4766 36 30.0959V11.7446C36 10.3639 34.8807 9.24458 33.5 9.24458H18.277C17.4901 9.24458 16.7492 8.87409 16.277 8.24458L13.3986 4.40674Z"
        fill="url(#paint0_linear_2816_28044)" // ✅ Uses the gradient fill
      />
    </svg>
  );
}

export function ArrowDownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height={24}
      width={24}
      {...props} // ✅ Allows passing dynamic props (size, color, etc.)
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.669 16.75a.75.75 0 0 1-.548-.237l-4.61-4.607a.75.75 0 0 1 1.06-1.061l3.348 3.345V4a.75.75 0 0 1 1.5 0v10.185l3.343-3.34a.75.75 0 0 1 1.06 1.06l-4.575 4.573a.75.75 0 0 1-.578.272M5.417 16a.75.75 0 0 0-1.5 0v2.5a2.25 2.25 0 0 0 2.25 2.25h13a2.25 2.25 0 0 0 2.25-2.25V16a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 1-.75.75h-13a.75.75 0 0 1-.75-.75z"
      />
    </svg>
  );
}

export function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      height={24}
      width={24}
      {...props} // ✅ Allows passing dynamic props (size, color, etc.)
    >
      <path d="M6.708 5.931V18.07a1.5 1.5 0 0 0 2.285 1.278l9.884-6.069a1.5 1.5 0 0 0 0-2.556L8.993 4.653a1.5 1.5 0 0 0-2.285 1.278Z" />
    </svg>
  );
}

export function MusicNoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height={24}
      width={24}
      {...props} // ✅ Allows dynamic props like size, color, etc.
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.417 4a.75.75 0 0 0-.889-.737l-12 2.25a.75.75 0 0 0-.611.737v8.209A3.95 3.95 0 0 0 6.042 14c-.875 0-1.694.27-2.311.74-.618.47-1.064 1.174-1.064 2.01s.446 1.54 1.064 2.01c.617.47 1.436.74 2.31.74s1.694-.27 2.311-.74c.606-.46 1.047-1.146 1.064-1.96v-6.18l10.5-2.01v3.599a3.95 3.95 0 0 0-1.874-.459c-.875 0-1.694.27-2.311.74-.618.47-1.064 1.174-1.064 2.01s.446 1.54 1.064 2.01c.617.47 1.436.74 2.31.74s1.694-.27 2.311-.74c.606-.46 1.047-1.146 1.064-1.96V4m-1.5 10.5c0-.268-.141-.564-.474-.818-.333-.253-.826-.432-1.401-.432s-1.069.179-1.402.432c-.332.254-.473.55-.473.818s.14.564.473.818c.333.253.826.432 1.402.432.575 0 1.068-.179 1.401-.432.333-.254.474-.55.474-.818M7.443 15.932c.333.254.474.55.474.818s-.141.564-.474.818c-.333.253-.826.432-1.401.432s-1.069-.179-1.402-.432c-.332-.254-.473-.55-.473-.818s.14-.564.473-.818c.333-.253.826-.432 1.402-.432.575 0 1.068.179 1.401.432m12.474-8.85V4.904l-10.5 1.968v2.22z"
      />
    </svg>
  );
}

export function DocumentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height={24}
      width={24}
      {...props} // ✅ Allows dynamic props like size, color, etc.
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.834 19.75a2.25 2.25 0 0 1-2.25 2.25h-10.5a2.25 2.25 0 0 1-2.25-2.25V9.621c0-.596.236-1.169.658-1.59L10.86 2.66A2.25 2.25 0 0 1 12.45 2h5.133a2.25 2.25 0 0 1 2.25 2.25zm-2.25.75a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75h-5.002l.002 4a2.25 2.25 0 0 1-2.25 2.25h-4v10c0 .414.335.75.75.75zM7.393 8.25l3.69-3.691.001 2.941a.75.75 0 0 1-.75.75zm1.19 6.25a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75m0 3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75"
      />
    </svg>
  );
}

export function ArchiveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height={24}
      width={24}
      {...props} // ✅ Allows dynamic props like size, color, etc.
    >
      <path d="m9.05 3.9-.6.45zm-6.8-1.65H6.5V.75H2.25zM1.5 15V3H0v12zm16.25.75H2.25v1.5h15.5zM18.5 6v9H20V6zm-.75-2.25h-7.5v1.5h7.5zm-8.1-.3L8.3 1.65l-1.2.9 1.35 1.8zm.6.3a.75.75 0 0 1-.6-.3l-1.2.9a2.25 2.25 0 0 0 1.8.9zM20 6a2.25 2.25 0 0 0-2.25-2.25v1.5a.75.75 0 0 1 .75.75zm-2.25 11.25A2.25 2.25 0 0 0 20 15h-1.5a.75.75 0 0 1-.75.75zM0 15a2.25 2.25 0 0 0 2.25 2.25v-1.5A.75.75 0 0 1 1.5 15zM6.5 2.25a.75.75 0 0 1 .6.3l1.2-.9a2.25 2.25 0 0 0-1.8-.9zM2.25.75A2.25 2.25 0 0 0 0 3h1.5a.75.75 0 0 1 .75-.75z"/>
    </svg>
  );
}

export function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height={24}
      width={24}
      {...props} // ✅ Supports dynamic props like size and color
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M5.5 3.25A2.25 2.25 0 0 0 3.25 5.5V9a2.25 2.25 0 0 0 2.25 2.25H9A2.25 2.25 0 0 0 11.25 9V5.5A2.25 2.25 0 0 0 9 3.25zM4.75 5.5a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75V9a.75.75 0 0 1-.75.75H5.5A.75.75 0 0 1 4.75 9zm.75 7.25A2.25 2.25 0 0 0 3.25 15v3.5a2.25 2.25 0 0 0 2.25 2.25H9a2.25 2.25 0 0 0 2.25-2.25V15A2.25 2.25 0 0 0 9 12.75zM4.75 15a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H5.5a.75.75 0 0 1-.75-.75zm8-9.5A2.25 2.25 0 0 1 15 3.25h3.5a2.25 2.25 0 0 1 2.25 2.25V9a2.25 2.25 0 0 1-2.25 2.25H15A2.25 2.25 0 0 1 12.75 9zM15 4.75a.75.75 0 0 0-.75.75V9c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75V5.5a.75.75 0 0 0-.75-.75zm0 8A2.25 2.25 0 0 0 12.75 15v3.5A2.25 2.25 0 0 0 15 20.75h3.5a2.25 2.25 0 0 0 2.25-2.25V15a2.25 2.25 0 0 0-2.25-2.25zM14.25 15a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75z"
      />
    </svg>
  );
}

export function MonitorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  );
}

export function LogIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14,2 14,8 20,8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10,9 9,9 8,9"></polyline>
    </svg>
  );
}

export function StorageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  );
}

export function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9,22 9,12 15,12 15,22"></polyline>
    </svg>
  );
}

export function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15,3 21,3 21,9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
}

export function MigrationsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  );
}

export function DataCenterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Building Structure */}
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4v18"/>
      <path d="M19 21V11l-6-4"/>
      {/* Server Racks */}
      <path d="M9 9h.01"/>
      <path d="M9 12h.01"/>
      <path d="M9 15h.01"/>
      <path d="M9 18h.01"/>
      <path d="M15 13h.01"/>
      <path d="M15 16h.01"/>
      <path d="M15 19h.01"/>
    </svg>
  );
}

export function CloudIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>
  );
}

export function VultrIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 54 54"
      fill="none"
      {...props}
    >
      <g>
        <path 
          className="svg-logo__shape-1" 
          fill="currentColor" 
          opacity="0.8"
          d="M23.473,9.97C23.105,9.387,22.455,9,21.715,9H11.077C9.929,9,9,9.93,9,11.077C9,11.484,9.117,11.864,9.32,12.185L14.557,20.493000000000002L28.71,18.278000000000002L23.473,9.97Z"
        />
        <path 
          className="svg-logo__shape-2" 
          fill="currentColor" 
          opacity="0.6"
          d="M25.655,13.431C25.287000000000003,12.847999999999999,24.636000000000003,12.460999999999999,23.897000000000002,12.460999999999999H13.259C12.112,12.460999999999999,11.182,13.390999999999998,11.182,14.537999999999998C11.182,14.945999999999998,11.299000000000001,15.325,11.502,15.645999999999999L14.557,20.491999999999997L28.709,18.276999999999997L25.655,13.431Z"
        />
        <path 
          className="svg-logo__shape-3" 
          fill="#FFFFFF" 
          d="M14.557 20.493c-0.203-0.321-0.32-0.7-0.32-1.108 0-1.147 0.93-2.077 2.077-2.077h10.639c0.74 0 1.389 0.387 1.756 0.97l9.521 15.101c0.203 0.32 0.319 0.7 0.319 1.107 0 0.408-0.116 0.787-0.319 1.107l-5.32 8.438C32.543 44.613 31.893 45 31.154 45c-0.741 0-1.39-0.387-1.758-0.969L14.557 20.493z"
        />
        <path 
          className="svg-logo__shape-4" 
          fill="currentColor"
          d="M41.385 25.015c0.367 0.582 1.018 0.969 1.758 0.969s1.39-0.387 1.756-0.969l5.32-8.438c0.203-0.321 0.32-0.701 0.32-1.108 0-0.407-0.117-0.787-0.32-1.107l-2.77-4.392C47.082 9.387 46.432 9 45.691 9H35.055c-1.147 0-2.078 0.93-2.078 2.077 0 0.407 0.117 0.787 0.32 1.108L41.385 25.015z"
        />
      </g>
    </svg>
  );
}

export function PackerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
      <path d="M6 8h4v3H6z"/>
      <path d="M14 8h4v3h-4z"/>
      <circle cx="8" cy="13" r="1"/>
      <circle cx="16" cy="13" r="1"/>
    </svg>
  );
}

export function AWSIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 109 64"
      fill="currentColor"
      {...props}
    >
      <path d="M30.63 23.243c0 1.317.144 2.385.398 3.168.289.783.65 1.637 1.156 2.563.18.284.253.569.253.818 0 .356-.217.712-.687 1.068l-2.277 1.495c-.325.214-.65.32-.94.32-.361 0-.723-.178-1.084-.498a11.036 11.036 0 0 1-1.301-1.673 27.44 27.44 0 0 1-1.12-2.1c-2.82 3.275-6.362 4.912-10.627 4.912-3.037 0-5.458-.854-7.23-2.563-1.77-1.708-2.674-3.986-2.674-6.834 0-3.025 1.084-5.481 3.29-7.332 2.204-1.851 5.132-2.777 8.855-2.777 1.229 0 2.494.107 3.831.285 1.337.178 2.71.463 4.157.783V12.28c0-2.705-.579-4.592-1.7-5.695-1.156-1.104-3.108-1.638-5.89-1.638-1.266 0-2.567.143-3.904.463-1.338.32-2.64.712-3.904 1.21-.578.25-1.012.392-1.265.463-.253.071-.434.107-.579.107-.506 0-.759-.356-.759-1.104V4.342c0-.57.073-.996.253-1.246.181-.249.506-.498 1.012-.747 1.266-.64 2.784-1.175 4.555-1.602 1.77-.462 3.65-.676 5.638-.676 4.302 0 7.446.961 9.47 2.883 1.989 1.922 3 4.84 3 8.756v11.533h.073Zm-14.675 5.41c1.193 0 2.422-.213 3.723-.64 1.301-.428 2.458-1.21 3.434-2.279.578-.676 1.012-1.423 1.229-2.278.216-.854.361-1.886.361-3.096v-1.495a30.626 30.626 0 0 0-3.325-.605 27.649 27.649 0 0 0-3.398-.214c-2.422 0-4.193.463-5.386 1.424-1.192.96-1.77 2.313-1.77 4.093 0 1.673.433 2.919 1.337 3.773.867.89 2.132 1.317 3.795 1.317Zm29.024 3.844c-.65 0-1.084-.106-1.373-.356-.29-.213-.542-.711-.759-1.388L34.353 3.24c-.217-.712-.325-1.175-.325-1.424 0-.57.289-.89.867-.89h3.542c.687 0 1.157.107 1.41.356.29.214.506.712.723 1.388l6.072 23.564 5.639-23.564c.18-.712.398-1.174.687-1.388.289-.213.795-.356 1.445-.356h2.892c.687 0 1.157.107 1.446.356.289.214.542.712.687 1.388l5.71 23.849 6.254-23.849c.217-.712.47-1.174.723-1.388.289-.213.759-.356 1.41-.356h3.36c.58 0 .904.285.904.89 0 .178-.036.356-.072.57a4.998 4.998 0 0 1-.253.89l-8.71 27.514c-.218.712-.47 1.174-.76 1.388-.29.214-.759.356-1.374.356h-3.108c-.687 0-1.157-.107-1.446-.356-.289-.25-.542-.712-.687-1.424L55.787 7.795l-5.566 22.923c-.181.712-.398 1.174-.687 1.423-.29.25-.795.356-1.446.356H44.98Zm46.447.961c-1.88 0-3.759-.213-5.566-.64-1.807-.427-3.217-.89-4.157-1.424-.578-.32-.976-.676-1.12-.997a2.48 2.48 0 0 1-.217-.996v-1.816c0-.747.289-1.103.831-1.103.217 0 .434.035.65.107.218.07.543.213.904.356 1.23.534 2.567.96 3.976 1.245 1.446.285 2.856.427 4.302.427 2.277 0 4.048-.391 5.277-1.174 1.229-.783 1.88-1.922 1.88-3.382 0-.996-.326-1.815-.977-2.491-.65-.676-1.88-1.282-3.65-1.851l-5.241-1.602c-2.639-.818-4.59-2.029-5.784-3.63-1.192-1.566-1.807-3.31-1.807-5.162 0-1.495.325-2.811.976-3.95a9.196 9.196 0 0 1 2.603-2.92c1.084-.818 2.313-1.423 3.759-1.85C89.51.178 91.029 0 92.619 0c.795 0 1.627.035 2.422.142.831.107 1.59.25 2.35.392.722.178 1.409.356 2.06.57.65.213 1.156.426 1.518.64.506.285.867.57 1.084.89.217.284.325.676.325 1.174v1.673c0 .748-.289 1.14-.831 1.14-.289 0-.759-.143-1.374-.428-2.06-.925-4.373-1.388-6.94-1.388-2.06 0-3.686.32-4.807.997-1.12.676-1.699 1.708-1.699 3.168 0 .996.362 1.85 1.085 2.527.723.676 2.06 1.352 3.976 1.957l5.132 1.602c2.603.819 4.482 1.958 5.603 3.417 1.12 1.46 1.662 3.133 1.662 4.983 0 1.53-.325 2.92-.939 4.13-.651 1.21-1.518 2.277-2.639 3.132-1.12.89-2.458 1.53-4.012 1.993-1.627.498-3.325.747-5.169.747Z" />
      <path d="M98.254 50.76C86.363 59.408 69.085 64 54.23 64 33.41 64 14.65 56.42.481 43.82c-1.12-.997-.108-2.35 1.23-1.567 15.325 8.756 34.229 14.06 53.784 14.06 13.193 0 27.687-2.705 41.024-8.258 1.988-.89 3.687 1.282 1.735 2.705Z" />
      <path d="M103.199 45.204c-1.519-1.922-10.049-.925-13.916-.463-1.157.143-1.338-.854-.29-1.601 6.796-4.699 17.965-3.346 19.266-1.78 1.301 1.602-.362 12.6-6.723 17.868-.976.819-1.916.392-1.482-.676 1.446-3.524 4.663-11.461 3.145-13.348Z" />
    </svg>
  );
}

export function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

export function AnsibleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="24"
      height="24"
      {...props}
    >
      {/* Ansible-inspired automation icon with gears and play symbol */}
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="8" r="2" />
      <circle cx="16" cy="8" r="1.5" />
      <circle cx="8" cy="16" r="1.5" />
      <path d="m9 12 2 2 4-4" />
      <path d="M12 6v2" />
      <path d="M12 16v2" />
      <path d="M6 12h2" />
      <path d="M16 12h2" />
    </svg>
  );
}

export function TestIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="24"
      height="24"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

export function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function LoaderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}
