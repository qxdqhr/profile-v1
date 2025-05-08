'use client';

import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string;
  height?: number | string;
  maskClosable?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  zIndex?: number;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  width = 400,
  height = 'auto',
  maskClosable = true,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  zIndex = 1000,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 处理按ESC键关闭弹窗
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // 禁止背景滚动
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // 处理点击遮罩层关闭
  const handleMaskClick = (e: React.MouseEvent) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose();
    }
  };

  // 弹窗内容样式
  const modalStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    zIndex,
  };

  if (!isOpen) return null;

  // 使用Portal渲染到body下，避免层级问题
  return ReactDOM.createPortal(
    <div className={`${styles.modalOverlay}`} onClick={handleMaskClick}>
      <div
        className={`${styles.modalContainer} ${className}`}
        style={modalStyle}
        ref={modalRef}
      >
        {(title || showCloseButton) && (
          <div className={styles.modalHeader}>
            {title && <div className={styles.modalTitle}>{title}</div>}
            {showCloseButton && (
              <button className={styles.closeButton} onClick={onClose}>
                ×
              </button>
            )}
          </div>
        )}
        <div className={`${styles.modalContent} ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal; 