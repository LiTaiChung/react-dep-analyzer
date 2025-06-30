import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium'
}) => {
  const className = `badge badge--${variant} badge--${size}`;
  
  return (
    <span className={className}>
      {children}
    </span>
  );
};