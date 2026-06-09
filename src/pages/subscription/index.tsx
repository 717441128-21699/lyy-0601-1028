import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button, Picker } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { mockSubscriptions, mockRoutes, mockShipNames } from '@/data/subscription';
import type { Subscription } from '@/types';

const notifyTypes = ['开航提醒', '靠泊提醒', '延误提醒', '到港提醒'];

const SubscriptionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'subscribed'>('all');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedNotifyTypes, setSelectedNotifyTypes] = useState<string[]>(['开航提醒', '靠泊提醒', '延误提醒']);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useDidShow(() => {
    loadSubscriptions();
  });

  usePullDownRefresh(() => {
    loadSubscriptions();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const loadSubscriptions = () => {
    setSubscriptions(mockSubscriptions);
    filterSubscriptions(mockSubscriptions);
  };

  const filterSubscriptions = (data: Subscription[]) => {
    let filtered = data;
    if (activeTab === 'subscribed') {
      filtered = filtered.filter(s => s.isSubscribed);
    }
    setFilteredSubscriptions(filtered);
  };

  const handleTabChange = (tab: 'all' | 'subscribed') => {
    setActiveTab(tab);
    filterSubscriptions(subscriptions);
  };

  const handleSearch = () => {
    if (!selectedRoute && !selectedShip) {
      Taro.showToast({
        title: '请选择航线或船名',
        icon: 'none'
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let filtered = mockSubscriptions;
      if (selectedRoute) {
        filtered = filtered.filter(s => s.route === selectedRoute);
      }
      if (selectedShip) {
        filtered = filtered.filter(s => s.shipName === selectedShip);
      }
      setFilteredSubscriptions(filtered);
      setLoading(false);
      console.log('[SubscriptionPage] 搜索条件:', { route: selectedRoute, ship: selectedShip });
    }, 500);
  };

  const handleSubscribe = (item: Subscription) => {
    if (item.isSubscribed) {
      Taro.showModal({
        title: '提示',
        content: '确定要取消订阅吗？',
        success: (res) => {
          if (res.confirm) {
            const updated = subscriptions.map(s =>
              s.id === item.id ? { ...s, isSubscribed: false } : s
            );
            setSubscriptions(updated);
            filterSubscriptions(updated);
            Taro.showToast({
              title: '已取消订阅',
              icon: 'success'
            });
            console.log('[SubscriptionPage] 取消订阅:', item.shipName);
          }
        }
      });
    } else {
      const updated = subscriptions.map(s =>
        s.id === item.id ? { ...s, isSubscribed: true, notifyTypes: selectedNotifyTypes } : s
      );
      setSubscriptions(updated);
      filterSubscriptions(updated);
      Taro.showToast({
        title: '订阅成功',
        icon: 'success'
      });
      console.log('[SubscriptionPage] 订阅成功:', item.shipName);
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
        </Text>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterTitle}>筛选条件</Text>

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
      </Text>

      {filteredSubscriptions.length > 0 ? (
        <View className={styles.subscriptionList}>
          {filteredSubscriptions.map(item => (
            <View key={item.id} className={styles.subscriptionCard}>
              <View className={styles.cardHeader}>
                <View className={styles.shipInfo}>
                  <Text className={styles.shipName}>🚢 {item.shipName}</Text>
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
            actionText="去订阅"
            onAction={() => handleTabChange('all')}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default SubscriptionPage;
