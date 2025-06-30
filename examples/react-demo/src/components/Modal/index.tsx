import React from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/elements/Icon';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = '確認'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <Button onClick={onClose} icon="close">
            <Icon name="close" />
          </Button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <Button onClick={onClose}>取消</Button>
          {onConfirm && (
            <Button onClick={onConfirm} icon="check">
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};