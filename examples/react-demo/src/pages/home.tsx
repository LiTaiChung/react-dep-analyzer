import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const HomePage: React.FC = () => {
  return (
    <div className="home">
      <h1>首頁</h1>
      <Button icon="home">
        回到首頁
      </Button>
      <Card
        title="歡迎"
        content="這是一個示例專案"
        onAction={() => console.log('clicked')}
      />
    </div>
  );
}; 