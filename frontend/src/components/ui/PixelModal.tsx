import React from 'react';
import { X } from 'lucide-react';
import { PixelButton } from './Pixel';

/**
 * The one full-screen modal shell used everywhere in the app (lesson folder, teaching
 * material picker, etc.) — same parchment panel, same tab bar, same close button, in
 * every place it's used. Only the content inside differs per screen.
 */

export interface PixelModalTab {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface PixelModalProps {
  onClose: () => void;
  tabs?: PixelModalTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function PixelModal({ onClose, tabs, activeTab, onTabChange, children, maxWidthClass = 'max-w-4xl' }: PixelModalProps) {
  return (
    <div
      className={`bg-[#ebd09b] border-8 border-[#c2964e] w-full ${maxWidthClass} h-[80vh] text-[#5e411b] relative shadow-[12px_12px_0_rgba(0,0,0,0.5)] flex flex-col overflow-hidden`}
    >
      <PixelButton
        variant="danger"
        size="icon"
        onClick={onClose}
        className="absolute top-3 right-3 z-[60] !min-h-0 !min-w-0 !p-2"
        aria-label="Close"
      >
        <X size={20} />
      </PixelButton>

      {tabs && tabs.length > 0 && (
        <div className="flex bg-[#d4bb72] border-b-8 border-[#c2964e] pr-14">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`px-6 py-4 font-retro text-base flex items-center gap-2 transition-colors ${
                activeTab === tab.id ? 'bg-[#ebd09b] border-b-8 border-[#ebd09b] -mb-2' : 'hover:bg-[#e4ca8d]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-8 flex-1 flex flex-col overflow-y-auto custom-scrollbar font-pixel">
        {children}
      </div>
    </div>
  );
}
