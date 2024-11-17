import React from 'react';
import { Button } from '@/components/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="about">
      <h1>關於我們</h1>
      <Button icon="info">
        更多資訊
      </Button>
    </div>
  );
}; 