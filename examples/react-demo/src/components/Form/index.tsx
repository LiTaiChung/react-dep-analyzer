import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';

interface FormProps {
  onSubmit: (data: FormData) => void;
}

interface FormData {
  name: string;
  email: string;
  message: string;
}

export const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = () => {
    onSubmit(formData);
    setShowModal(false);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">姓名</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange('name')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">電子郵件</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message">訊息</label>
          <textarea
            id="message"
            value={formData.message}
            onChange={handleInputChange('message')}
            rows={4}
            required
          />
        </div>
        
        <Button type="submit" icon="send">
          送出表單
        </Button>
      </form>

      <Modal
        isOpen={showModal}
        title="確認送出"
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        confirmText="送出"
      >
        <p>確定要送出以下資料嗎？</p>
        <ul>
          <li>姓名: {formData.name}</li>
          <li>電子郵件: {formData.email}</li>
          <li>訊息: {formData.message}</li>
        </ul>
      </Modal>
    </>
  );
};