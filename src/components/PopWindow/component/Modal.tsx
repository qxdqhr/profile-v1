'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  // 确保只在客户端渲染Portal
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    // 处理按ESC键关闭弹窗
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // 禁止背景滚动
    if (isOpen && typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      // 安全地恢复样式和移除监听器
      try {
        if (typeof document !== 'undefined' && document.body) {
          document.body.style.overflow = '';
          document.removeEventListener('keydown', handleEscKey);
        }
      } catch (error) {
        console.warn('清理Modal事件监听器时出错:', error);
      }
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

  // 只在客户端且Modal打开时渲染
  if (!mounted || !isOpen) return null;

  // 安全检查document.body是否存在
  if (typeof document === 'undefined' || !document.body) {
    return null;
  }

  // 使用Portal渲染到body下，避免层级问题
  try {
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
  } catch (error) {
    console.error('Portal创建失败:', error);
    return null;
  }
};

export default Modal; 