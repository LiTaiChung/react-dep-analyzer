import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Form } from '@/components/Form';
import { Modal } from '@/components/Modal';
import { Badge } from '@/elements/Badge';

export const HomePage: React.FC = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    setShowContactForm(false);
    setShowThankYou(true);
  };

  return (
    <div className="home">
      <header className="hero">
        <h1>歡迎來到我們的網站</h1>
        <p>這是一個使用 React 組件的示例頁面。</p>
        <Badge variant="success">熱門推薦</Badge>
      </header>
      
      <section className="cards-container">
        <Card 
          title="關於我們"
          content="了解更多關於我們公司的資訊和發展歷程"
          onAction={() => console.log('Navigate to about')}
        />
        <Card 
          title="服務項目"
          content="查看我們提供的各種專業服務和解決方案"
          onAction={() => console.log('Navigate to services')}
        />
        <Card 
          title="最新消息"
          content="獲取最新的產品更新和公司動態"
          onAction={() => console.log('Navigate to news')}
        />
      </section>
      
      <section className="actions">
        <Button icon="phone" onClick={() => setShowContactForm(true)}>
          聯絡我們
        </Button>
        <Button icon="info">
          了解更多
        </Button>
      </section>

      <Modal
        isOpen={showContactForm}
        title="聯絡我們"
        onClose={() => setShowContactForm(false)}
      >
        <Form onSubmit={handleFormSubmit} />
      </Modal>

      <Modal
        isOpen={showThankYou}
        title="謝謝您的聯絡"
        onClose={() => setShowThankYou(false)}
      >
        <p>我們已收到您的訊息，將盡快回覆您。</p>
        <Badge variant="success" size="large">送出成功</Badge>
      </Modal>
    </div>
  );
}; 