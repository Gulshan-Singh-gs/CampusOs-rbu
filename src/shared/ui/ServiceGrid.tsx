import React from 'react';
import { CircularServiceItem, CircularServiceItemProps } from './CircularServiceItem';

export interface ServiceGridProps {
  title?: string;
  subtitle?: string;
  items: CircularServiceItemProps[];
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ title, subtitle, items }) => {
  return (
    <section className="w-full py-3 sm:py-6">
      {/* Editorial uppercase section title */}
      {title && (
        <div className="text-center mb-6 sm:mb-8 space-y-1">
          <h2
            className="text-xs font-bold uppercase tracking-[0.16em]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Responsive circular service grid: 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 sm:gap-y-8 gap-x-4 sm:gap-x-6 max-w-4xl mx-auto px-4 justify-items-center items-start">
        {items.map((item) => (
          <CircularServiceItem key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
};
