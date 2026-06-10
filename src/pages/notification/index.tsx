import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { NotificationRecord } from '@/types';

const NotificationPage: React.FC = () => {
  const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationCount,
    getSubscribedSubscriptions
  } = useAppStore();

  const [selectedShip, setSelectedShip] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<'ship' | 'route' | 'type'>('ship');
  const [tempFilter, setTempFilter] = useState<string>('');

  const notifications = useMemo(() => {
    return getNotifications({
      shipName: selectedShip || undefined,
      route: selectedRoute || undefined,
      type: selectedType || undefined
    });
  }, [getNotifications, selectedShip, selectedRoute, selectedType]);

  const unreadCount = useMemo(() => getUnreadNotificationCount(), [getUnreadNotificationCount]);

  const shipOptions = useMemo(() => {
    const ships = new Set<string>();
    getSubscribedSubscriptions().forEach(s => ships.add(s.shipName));
    return ['全部', ...Array.from(ships)];
  }, [getSubscribedSubscriptions]);

  const routeOptions = useMemo(() => {
    const routes = new Set<string>();
    getSubscribedSubscriptions().forEach(s => routes.add(s.route));
    return ['全部', ...Array.from(routes)];
  }, [getSubscribedSubscriptions]);

  const typeOptions = [
    { value: '', label: '全部' },
    { value: 'delay', label: '延误提醒' },
    { value: 'departure', label: '开航提醒' },
    { value: 'arrival', label: '到港提醒' },
    { value: 'berth', label: '靠泊提醒' }
  ];

  const loadData = useCallback(() => {
    // 数据已通过 store 实时获取
  }, []);

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    loadData();
    Taro.stopPullDownRefresh();
  });

  const handleOpenFilter = (type: 'ship' | 'route' | 'type') => {
    setFilterType(type);
    const currentValue = type === 'ship' ? selectedShip : type === 'route' ? selectedRoute : selectedType;
    setTempFilter(currentValue);
    setShowFilter(true);
  };

  const handleSelectFilter = (value: string) => {
    setTempFilter(value);
  };

  const handleConfirmFilter = () => {
    if (filterType === 'ship') {
      setSelectedShip(tempFilter === '全部' ? '' : tempFilter);
    } else if (filterType === 'route') {
      setSelectedRoute(tempFilter === '全部' ? '' : tempFilter);
    } else {
      setSelectedType(tempFilter);
    }
    setShowFilter(false);
  };

  const handleResetFilter = () => {
    setTempFilter('');
  };

  const handleNotificationClick = (item: NotificationRecord) => {
    if (!item.isRead) {
      markNotificationRead(item.id);
    }

    Taro.showModal({
      title: item.title,
      content: `${item.content}\n\n航线：${item.route}\n时间：${item.time}`,
      showCancel: false
    });
  };

  const handleViewTracking = (shipName: string) => {
    Taro.switchTab({ url: '/pages/tracking/index' });
    setTimeout(() => {
      Taro.eventCenter.trigger('searchShip', { shipName });
    }, 300);
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    Taro.showModal({
      title: '提示',
      content: '确定将所有消息标记为已读吗？',
      success: (res) => {
        if (res.confirm) {
          markAllNotificationsRead();
          Taro.showToast({ title: '操作成功', icon: 'success' });
        }
      }
    });
  };

  const getFilterLabel = () => {
    if (filterType === 'ship') {
      return {
        current: selectedShip || '全部',
        options: shipOptions.map(s => ({ value: s === '全部' ? '' : s, label: s }))
      };
    } else if (filterType === 'route') {
      return {
        current: selectedRoute || '全部',
        options: routeOptions.map(r => ({ value: r === '全部' ? '' : r, label: r }))
      };
    } else {
      return {
        current: typeOptions.find(t => t.value === selectedType)?.label || '全部',
        options: typeOptions
      };
    }
  };

  const filterLabel = getFilterLabel();

  return (
    <View className={styles.page}>
      <View className={styles.filterBar}>
        <View className={styles.filterItem} onClick={() => handleOpenFilter('ship')}>
          <Text className={styles.filterText}>船名</Text>
          <Text className={styles.filterValue}>{selectedShip || '全部'}</Text>
        </View>
        <View className={styles.filterItem} onClick={() => handleOpenFilter('route')}>
          <Text className={styles.filterText}>航线</Text>
          <Text className={styles.filterValue}>{selectedRoute || '全部'}</Text>
        </View>
        <View className={styles.filterItem} onClick={() => handleOpenFilter('type')}>
          <Text className={styles.filterText}>类型</Text>
          <Text className={styles.filterValue}>
            {typeOptions.find(t => t.value === selectedType)?.label || '全部'}
          </Text>
        </View>
      </View>

      <View className={styles.header}>
        <Text className={styles.unreadCount}>
          共 {notifications.length} 条
          {unreadCount > 0 && (
            <Text className={styles.unreadBadge}>{unreadCount} 条未读</Text>
          )}
        </Text>
        {unreadCount > 0 && (
          <Text className={styles.readAllBtn} onClick={handleMarkAllRead}>
            全部已读
          </Text>
        )}
      </View>

      <ScrollView className={styles.listContainer} scrollY>
        {notifications.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🔔</Text>
            <Text className={styles.emptyText}>暂无提醒记录</Text>
            <Text className={styles.emptySubText}>订阅航线后将实时推送船舶动态</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View
              key={item.id}
              className={classnames(styles.notificationCard, !item.isRead && styles.unread)}
              onClick={() => handleNotificationClick(item)}
            >
              <View className={styles.cardHeader}>
                <View className={classnames(styles.typeTag, styles[item.type])}>
                  {item.typeText}
                </View>
                <Text className={styles.timeText}>{item.time}</Text>
              </View>

              <Text className={styles.title}>{item.title}</Text>
              <Text className={styles.content}>{item.content}</Text>

              {item.originalTime && item.estimatedTime && (
                <View className={styles.timeInfo}>
                  <View className={styles.timeRow}>
                    <Text className={styles.timeLabel}>原定时间</Text>
                    <Text className={styles.timeValue}>{item.originalTime}</Text>
                  </View>
                  <View className={styles.timeRow}>
                    <Text className={styles.timeLabel}>预计时间</Text>
                    <Text className={classnames(styles.timeValue, styles.changed)}>
                      {item.estimatedTime}
                    </Text>
                  </View>
                </View>
              )}

              <View className={styles.cardFooter}>
                <View className={styles.shipInfo}>
                  <Text className={styles.shipName} onClick={(e) => {
                    e.stopPropagation();
                    handleViewTracking(item.shipName);
                  }}>
                    {item.shipName}
                  </Text>
                  <Text>{item.route}</Text>
                </View>
                <Text
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewTracking(item.shipName);
                  }}
                >
                  查看轨迹
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View className={classnames(styles.filterPanel, !showFilter && styles.hidden)} onClick={() => setShowFilter(false)}>
        <View className={styles.filterContent} onClick={(e) => e.stopPropagation()}>
          <View className={styles.filterHeader}>
            <Text className={styles.filterTitle}>
              选择{filterType === 'ship' ? '船名' : filterType === 'route' ? '航线' : '类型'}
            </Text>
            <Text className={styles.filterReset} onClick={handleResetFilter}>
              重置
            </Text>
          </View>

          <View className={styles.filterSection}>
            <View className={styles.filterOptions}>
              {filterLabel.options.map((opt) => (
                <View
                  key={opt.value}
                  className={classnames(styles.filterOption, tempFilter === opt.value && styles.active)}
                  onClick={() => handleSelectFilter(opt.value)}
                >
                  {opt.label}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterActions}>
            <View className={classnames(styles.filterActionBtn, styles.cancel)} onClick={() => setShowFilter(false)}>
              取消
            </View>
            <View className={classnames(styles.filterActionBtn, styles.confirm)} onClick={handleConfirmFilter}>
              确定
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default NotificationPage;
