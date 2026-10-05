import React from 'react';
import { CircularServiceItem, CircularServiceItemProps } from './CircularServiceItem';

export interface ServiceGridProps {
  title?: string;
  subtitle?: string;
  items: CircularServiceItemProps[];
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ title, subtitle, items }) => {
  return (
    <section className="w-full py-6 sm:py-10">
      {/* Editorial uppercase section title */}
      {title && (
        <div className="text-center mb-8 sm:mb-12 space-y-2">
          <h2
            className="text-xs sm:text-sm font-bold uppercase tracking-[0.16em]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Responsive circular service grid: 2 col mobile, 3 col tablet, 4 col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 sm:gap-y-14 gap-x-6 sm:gap-x-10 max-w-5xl mx-auto px-4 justify-items-center items-start">
        {items.map((item) => (
          <CircularServiceItem key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
};
