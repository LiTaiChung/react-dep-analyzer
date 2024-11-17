import React from 'react';
import { Icon } from '@/elements/Icon';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick,
  icon 
}) => {
  return (
    <button 
      className="button" 
      onClick={onClick}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}; 