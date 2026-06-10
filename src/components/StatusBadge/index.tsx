import React from 'react';
import { Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatusBadgeProps {
  status: 'transit' | 'completed' | 'exception' | 'pending' | 'normal' | 'delayed' | 'cancelled' | 'sailing' | 'moored' | 'anchored' | 'paid' | 'partial' | 'unpaid' | 'processing' | 'need_more' | 'resolved';
  text: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'transit':
      case 'sailing':
      case 'normal':
      case 'processing':
        return styles.transit;
      case 'completed':
      case 'paid':
      case 'moored':
      case 'resolved':
        return styles.completed;
      case 'exception':
      case 'cancelled':
      case 'unpaid':
      case 'need_more':
        return styles.exception;
      case 'delayed':
      case 'partial':
      case 'anchored':
        return styles.delayed;
      case 'pending':
        return styles.pending;
      default:
        return styles.pending;
    }
  };

  return (
    <Text className={`${styles.badge} ${getStatusClass()}`}>
      {text}
    </Text>
  );
};

export default StatusBadge;
