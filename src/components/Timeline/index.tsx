import React from 'react';
import { View, Text } from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';
import type { WaybillNode } from '@/types';

interface TimelineProps {
  nodes: WaybillNode[];
}

const Timeline: React.FC<TimelineProps> = ({ nodes }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#00B42A';
      case 'current':
        return '#0077C8';
      default:
        return '#C9CDD4';
    }
  };

  return (
    <View className={styles.timeline}>
      {nodes.map((node, index) => (
        <View
          key={node.id}
          className={classNames(styles.timelineItem, {
            [styles.last]: index === nodes.length - 1
          })}
        >
          <View className={styles.timelineLeft}>
            <View
              className={classNames(styles.dot, {
                [styles.completed]: node.status === 'completed',
                [styles.current]: node.status === 'current',
                [styles.pending]: node.status === 'pending'
              })}
            >
              {node.status === 'completed' && (
                <Text className={styles.dotIcon}>✓</Text>
              )}
              {node.status === 'current' && (
                <View className={styles.dotPulse} />
              )}
            </View>
            {index < nodes.length - 1 && (
              <View
                className={styles.line}
                style={{
                  backgroundColor:
                    node.status === 'completed' ? '#00B42A' : '#E5E6EB'
                }}
              />
            )}
          </View>
          <View className={styles.timelineContent}>
            <View className={styles.nodeHeader}>
              <Text
                className={styles.nodeName}
                style={{ color: getStatusColor(node.status) }}
              >
                {node.name}
              </Text>
              {node.time && (
                <Text className={styles.nodeTime}>{node.time}</Text>
              )}
            </View>
            {node.location && (
              <View className={styles.nodeInfo}>
                <Text className={styles.nodeLabel}>位置：</Text>
                <Text className={styles.nodeValue}>{node.location}</Text>
              </View>
            )}
            {node.operator && (
              <View className={styles.nodeInfo}>
                <Text className={styles.nodeLabel}>操作人：</Text>
                <Text className={styles.nodeValue}>{node.operator}</Text>
              </View>
            )}
            {node.remark && (
              <View className={styles.nodeRemark}>
                <Text className={styles.remarkText}>{node.remark}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

export default Timeline;
