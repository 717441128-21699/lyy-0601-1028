import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Picker } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { mockRoutes, mockShipNames } from '@/data/subscription';
import type { Subscription } from '@/types';

const notifyTypes = ['开航提醒', '靠泊提醒', '延误提醒', '到港提醒'];

const SubscriptionPage: React.FC = () => {
  const {
    subscriptions,
    toggleSubscription,
    getSubscribedSubscriptions
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'subscribed'>('all');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedNotifyTypes, setSelectedNotifyTypes] = useState<string[]>(['开航提醒', '靠泊提醒', '延误提醒']);
  const [hasSearched, setHasSearched] = useState(false);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const subscribedCount = useMemo(() => {
    return getSubscribedSubscriptions().length;
  }, [getSubscribedSubscriptions]);

  const filteredSubscriptions = useMemo(() => {
    let data = activeTab === 'subscribed'
      ? getSubscribedSubscriptions()
      : subscriptions;

    if (hasSearched) {
      if (selectedRoute) {
        data = data.filter(s => s.route === selectedRoute);
      }
      if (selectedShip) {
        data = data.filter(s => s.shipName === selectedShip);
      }
    }

    return data;
  }, [activeTab, subscriptions, getSubscribedSubscriptions, selectedRoute, selectedShip, hasSearched]);

  const handleTabChange = (tab: 'all' | 'subscribed') => {
    setActiveTab(tab);
  };

  const handleSearch = () => {
    if (!selectedRoute && !selectedShip) {
      setHasSearched(false);
      Taro.showToast({
        title: '请选择航线或船名',
        icon: 'none'
      });
      return;
    }
    setHasSearched(true);
    Taro.showToast({ title: '搜索完成', icon: 'success' });
  };

  const handleReset = () => {
    setSelectedRoute('');
    setSelectedShip('');
    setHasSearched(false);
    Taro.showToast({ title: '已重置', icon: 'success' });
  };

  const handleSubscribe = (item: Subscription) => {
    if (item.isSubscribed) {
      Taro.showModal({
        title: '提示',
        content: '确定要取消订阅吗？',
        success: (res) => {
          if (res.confirm) {
            toggleSubscription(item.id);
            Taro.showToast({
              title: '已取消订阅',
              icon: 'success'
            });
          }
        }
      });
    } else {
      toggleSubscription(item.id);
      Taro.showToast({
        title: '订阅成功',
        icon: 'success'
      });
    }
  };

  const handleNotifyTypeToggle = (type: string) => {
    setSelectedNotifyTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleViewDetail = (item: Subscription) => {
    Taro.navigateTo({
      url: `/pages/subscription-detail/index?id=${item.id}`
    });
  };

  const handleViewTracking = (shipName: string) => {
    Taro.switchTab({
      url: '/pages/tracking/index'
    });
    setTimeout(() => {
      Taro.eventCenter.trigger('searchShip', { shipName });
    }, 300);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>船期订阅</Text>
        <Text className={styles.pageSubtitle}>订阅航线，实时获取船期动态</Text>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classNames(styles.tabItem, { [styles.active]: activeTab === 'all' })}
          onClick={() => handleTabChange('all')}
        >
          全部航线
        </Text>
        <Text
          className={classNames(styles.tabItem, { [styles.active]: activeTab === 'subscribed' })}
          onClick={() => handleTabChange('subscribed')}
        >
          我的订阅
          {subscribedCount > 0 && (
            <Text className={styles.tabBadge}>{subscribedCount}</Text>
          )}
        </Text>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterHeader}>
          <Text className={styles.filterTitle}>筛选条件</Text>
          {hasSearched && (
            <Text className={styles.resetBtn} onClick={handleReset}>重置</Text>
          )}
        </View>

        <View className={styles.filterRow}>
          <View className={styles.filterItem}>
            <Text className={styles.filterLabel}>选择航线</Text>
            <Picker
              mode="selector"
              range={mockRoutes}
              value={mockRoutes.indexOf(selectedRoute)}
              onChange={(e) => setSelectedRoute(mockRoutes[e.detail.value])}
            >
              <Button className={styles.pickerBtn}>
                <Text className={styles.pickerText}>
                  {selectedRoute || '请选择航线'}
                </Text>
                <Text className={styles.pickerIcon}>▼</Text>
              </Button>
            </Picker>
          </View>
        </View>

        <View className={styles.filterRow}>
          <View className={styles.filterItem}>
            <Text className={styles.filterLabel}>选择船名</Text>
            <Picker
              mode="selector"
              range={mockShipNames}
              value={mockShipNames.indexOf(selectedShip)}
              onChange={(e) => setSelectedShip(mockShipNames[e.detail.value])}
            >
              <Button className={styles.pickerBtn}>
                <Text className={styles.pickerText}>
                  {selectedShip || '请选择船名'}
                </Text>
                <Text className={styles.pickerIcon}>▼</Text>
              </Button>
            </Picker>
          </View>
        </View>

        <Text className={styles.filterLabel}>提醒类型</Text>
        <View className={styles.notifyOptions}>
          {notifyTypes.map(type => (
            <Button
              key={type}
              className={classNames(styles.notifyOption, {
                [styles.selected]: selectedNotifyTypes.includes(type)
              })}
              onClick={() => handleNotifyTypeToggle(type)}
            >
              {type}
            </Button>
          ))}
        </View>

        <Button className={styles.searchBtn} onClick={handleSearch}>
          搜索船期
        </Button>
      </View>

      <Text className={styles.sectionTitle}>
        {activeTab === 'all' ? '全部航线' : '我的订阅'}
        {filteredSubscriptions.length > 0 && (
          <Text className={styles.countText}> ({filteredSubscriptions.length})</Text>
        )}
      </Text>

      {filteredSubscriptions.length > 0 ? (
        <View className={styles.subscriptionList}>
          {filteredSubscriptions.map(item => (
            <View key={item.id} className={styles.subscriptionCard}>
              <View className={styles.cardHeader}>
                <View className={styles.shipInfo}>
                  <Text
                    className={styles.shipName}
                    onClick={() => handleViewTracking(item.shipName)}
                  >
                    🚢 {item.shipName} →
                  </Text>
                  <Text className={styles.routeText}>{item.route}</Text>
                </View>
                <StatusBadge status={item.status} text={item.statusText} />
              </View>

              <View className={styles.routeSection}>
                <View className={styles.portInfo}>
                  <Text className={styles.portLabel}>出发港</Text>
                  <Text className={styles.portName}>{item.startPort}</Text>
                  <Text className={styles.portTime}>预计 {item.estimatedDeparture}</Text>
                </View>
                <Text className={styles.routeArrow}>→</Text>
                <View className={styles.portInfo}>
                  <Text className={styles.portLabel}>到达港</Text>
                  <Text className={styles.portName}>{item.endPort}</Text>
                  <Text className={styles.portTime}>预计 {item.estimatedArrival}</Text>
                </View>
              </View>

              <View className={styles.tags}>
                {item.notifyTypes.map((tag, index) => (
                  <Text key={index} className={styles.tag}>{tag}</Text>
                ))}
              </View>

              <View className={styles.cardFooter}>
                <Button
                  className={classNames(styles.subscribeBtn, {
                    [styles.subscribed]: item.isSubscribed
                  })}
                  onClick={() => handleSubscribe(item)}
                >
                  {item.isSubscribed ? '✓ 已订阅' : '+ 订阅'}
                </Button>
                <Button
                  className={styles.viewDetailBtn}
                  onClick={() => handleViewDetail(item)}
                >
                  查看详情 →
                </Button>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyWrapper}>
          <EmptyState
            icon="🔔"
            title={activeTab === 'all' ? '暂无航线数据' : '暂无订阅'}
            description={activeTab === 'all' ? '请尝试其他筛选条件' : '订阅后可实时获取船期动态'}
            actionText={activeTab === 'all' ? '重置筛选' : '去订阅'}
            onAction={() => {
              if (activeTab === 'all') {
                handleReset();
              } else {
                handleTabChange('all');
              }
            }}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default SubscriptionPage;
