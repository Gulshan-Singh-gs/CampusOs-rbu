import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface CircularServiceItemProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick: () => void;
}

export const CircularServiceItem: React.FC<CircularServiceItemProps> = ({
  id,
  title,
  subtitle,
  badge,
  icon: Icon,
  isActive = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      id={`service-item-${id}`}
      onClick={onClick}
      aria-pressed={isActive}
      className="group flex flex-col items-center text-center focus:outline-none transition-transform w-full"
    >
      {/* Circular interactive surface */}
      <div
        className={`circular-service-button relative ${isActive ? 'is-active' : ''}`}
      >
        {/* Line Icon */}
        <Icon
          className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-200 group-hover:scale-105"
          style={{ color: 'var(--icon-color)' }}
          strokeWidth={1.8}
        />

        {/* Optional floating badge */}
        {badge && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white shadow-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Text label underneath */}
      <div className="mt-4 sm:mt-5 max-w-[150px] space-y-1">
        <h4 className="text-sm sm:text-base font-medium tracking-tight transition-colors leading-snug"
            style={{ color: 'var(--text-primary)' }}>
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
};
