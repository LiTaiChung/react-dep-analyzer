import React from 'react';
import { Button } from '@/components/Button';

interface CardProps {
  title: string;
  content: string;
  onAction?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  content,
  onAction 
}) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{content}</p>
      <Button onClick={onAction} icon="arrow-right">
        了解更多
      </Button>
    </div>
  );
}; 