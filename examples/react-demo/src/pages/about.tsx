import React from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/elements/Badge';
import { Icon } from '@/elements/Icon';

export const AboutPage: React.FC = () => {
  const teamMembers = [
    { name: '張三', role: '前端工程師', experience: '5年' },
    { name: '李四', role: '後端工程師', experience: '3年' },
    { name: '王五', role: 'UI/UX 設計師', experience: '4年' }
  ];

  return (
    <div className="about">
      <header className="about-header">
        <h1>關於我們</h1>
        <p>我們是一支專業的開發團隊，致力於提供優質的技術服務。</p>
        <Badge variant="primary" size="large">專業團隊</Badge>
      </header>

      <section className="company-info">
        <Card
          title="我們的使命"
          content="透過創新的技術解決方案，幫助客戶實現數位轉型。"
          onAction={() => console.log('Learn more about mission')}
        />
        <Card
          title="我們的願景"
          content="成為業界領先的技術服務提供商，創造更美好的數位世界。"
          onAction={() => console.log('Learn more about vision')}
        />
        <Card
          title="我們的價值觀"
          content="誠信、創新、品質、服務是我們的核心價值觀。"
          onAction={() => console.log('Learn more about values')}
        />
      </section>

      <section className="team-section">
        <h2>我們的團隊</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <Icon name="user" />
              <h3>{member.name}</h3>
              <Badge variant="secondary">{member.role}</Badge>
              <p>經驗: {member.experience}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-section">
        <h2>聯絡方式</h2>
        <div className="contact-actions">
          <Button icon="email">
            發送郵件
          </Button>
          <Button icon="phone">
            撥打電話
          </Button>
          <Button icon="location">
            查看地址
          </Button>
        </div>
      </section>
    </div>
  );
}; 