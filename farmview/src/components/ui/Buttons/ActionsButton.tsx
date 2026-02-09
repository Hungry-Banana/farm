import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export type ActionItem = {
  label: string;
  action: () => void;
  icon?: React.ReactNode | string;
  danger?: boolean;
};

interface ActionsButtonProps {
  items: ActionItem[];
  buttonLabel?: string;
  className?: string;
  dropdownWidth?: number;
}

export default function ActionsButton({ items, buttonLabel = 'Actions', className = '', dropdownWidth = 208 }: ActionsButtonProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const ddWidth = dropdownWidth;

      let leftPosition = rect.right - ddWidth;
      if (leftPosition < 10) leftPosition = 10;
      if (leftPosition + ddWidth > viewportWidth - 10) leftPosition = viewportWidth - ddWidth - 10;

      setDropdownPosition({
        top: rect.bottom + 8,
        left: leftPosition,
      });
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      updateDropdownPosition();
    }
  }, [dropdownOpen, dropdownWidth]);

  useEffect(() => {
    if (dropdownOpen) {
      const handleScroll = () => {
        updateDropdownPosition();
      };

      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [dropdownOpen, dropdownWidth]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setDropdownOpen((p) => !p)}
        className={`p-3 rounded-theme border border-island_border bg-island_background hover:bg-accent/50 transition-colors cursor-pointer flex items-center gap-2 ${className}`}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.27 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.27-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{buttonLabel}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="fixed bg-island_background border border-island_border shadow-xl rounded-theme z-[1050] overflow-hidden backdrop-blur-sm"
          style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, width: `${dropdownWidth}px` }}
        >
          <div className="py-2">
            {items.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  try {
                    action.action();
                  } catch (e) {
                    console.error('Action click failed', e);
                  }
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-150 border-0 focus:outline-none ${
                  action.danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-foreground hover:bg-primary focus:bg-primary/10'
                }`}
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
