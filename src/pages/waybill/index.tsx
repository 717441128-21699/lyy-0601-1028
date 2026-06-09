import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import SearchBar from '@/components/SearchBar';
import StatusBadge from '@/components/StatusBadge';
import Timeline from '@/components/Timeline';
import EmptyState from '@/components/EmptyState';
import { mockWaybills, getWaybillByNo } from '@/data/waybill';
import type { WaybillInfo } from '@/types';

const WaybillPage: React.FC = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<WaybillInfo | null>(null);
  const [recentWaybills, setRecentWaybills] = useState<WaybillInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentWaybills();
    loadSearchHistory();
  }, []);

  useDidShow(() => {
    loadRecentWaybills();
  });

  usePullDownRefresh(() => {
    loadRecentWaybills();
    if (searchResult) {
      handleSearch(searchResult.waybillNo);
    }
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const loadRecentWaybills = () => {
    setRecentWaybills(mockWaybills.slice(0, 3));
  };

  const loadSearchHistory = () => {
    try {
      const history = Taro.getStorageSync('waybill_search_history') || [];
      setSearchHistory(history);
    } catch (e) {
      console.error('[WaybillPage] loadSearchHistory failed:', e);
    }
  };

  const saveSearchHistory = (waybillNo: string) => {
    try {
      let history = Taro.getStorageSync('waybill_search_history') || [];
      history = history.filter((h: string) => h !== waybillNo);
      history.unshift(waybillNo);
      history = history.slice(0, 10);
      Taro.setStorageSync('waybill_search_history', history);
      setSearchHistory(history);
    } catch (e) {
      console.error('[WaybillPage] saveSearchHistory failed:', e);
    }
  };

  const handleSearch = (waybillNo: string) => {
    setLoading(true);
    setTimeout(() => {
      const result = getWaybillByNo(waybillNo);
      if (result) {
        setSearchResult(result);
        saveSearchHistory(waybillNo);
        console.log('[WaybillPage] 查询成功:', waybillNo);
      } else {
        Taro.showToast({
          title: '未找到该运单',
          icon: 'none'
        });
        console.log('[WaybillPage] 未找到运单:', waybillNo);
      }
      setLoading(false);
    }, 500);
  };

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        console.log('[WaybillPage] 扫码结果:', res.result);
        handleSearch(res.result);
      },
      fail: (err) => {
        console.error('[WaybillPage] 扫码失败:', err);
        Taro.showToast({
          title: '扫码失败，请重试',
          icon: 'none'
        });
      }
    });
  };

  const handleClearHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确定清空搜索历史？',
      success: (res) => {
        if (res.confirm) {
          try {
            Taro.removeStorageSync('waybill_search_history');
            setSearchHistory([]);
          } catch (e) {
            console.error('[WaybillPage] clearHistory failed:', e);
          }
        }
      }
    });
  };

  const handleShare = () => {
    if (!searchResult) return;
    Taro.showShareMenu({
      withShareTicket: true
    });
    Taro.showToast({
      title: '请点击右上角分享',
      icon: 'none'
    });
    console.log('[WaybillPage] 分享运单:', searchResult.waybillNo);
  };

  const handleDownloadReceipt = () => {
    if (!searchResult) return;
    Taro.showLoading({ title: '正在生成...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '电子回单已下载',
        icon: 'success'
      });
      console.log('[WaybillPage] 下载电子回单:', searchResult.waybillNo);
    }, 1500);
  };

  const handleContact = () => {
    Taro.navigateTo({
      url: '/pages/customer-service/index'
    });
  };

  const handleViewDetail = (waybillNo: string) => {
    Taro.navigateTo({
      url: `/pages/waybill-detail/index?waybillNo=${waybillNo}`
    });
  };

  const handleBackToSearch = () => {
    setSearchResult(null);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>运单查询</Text>
        <Text className={styles.pageSubtitle}>输入运单号或扫码查询运输进度</Text>
      </View>

      <View className={styles.searchSection}>
        <SearchBar
          placeholder="请输入运单号，如 SY202406100001"
          onSearch={handleSearch}
          onScan={handleScan}
        />
      </View>

      {searchResult ? (
        <View className={styles.detailContent}>
          <Button
            className={classNames(styles.actionBtn, styles.backBtn)}
            onClick={handleBackToSearch}
          >
            ← 返回查询
          </Button>

          <View className={styles.resultCard}>
            <View className={styles.resultHeader}>
              <View>
                <Text className={styles.resultWaybillNo}>{searchResult.waybillNo}</Text>
                <Text className={styles.resultRoute}>
                  {searchResult.startPort} → {searchResult.endPort}
                </Text>
              </View>
              <StatusBadge status={searchResult.status} text={searchResult.statusText} />
            </View>

            <View className={styles.infoGrid}>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>船名</Text>
                <Text className={styles.infoValue}>{searchResult.shipName}</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>箱号</Text>
                <Text className={styles.infoValue}>{searchResult.containerNo}</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>货物名称</Text>
                <Text className={styles.infoValue}>{searchResult.cargoName}</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>预计到达</Text>
                <Text className={styles.infoValue}>{searchResult.estimatedArrivalTime}</Text>
              </View>
            </View>
          </View>

          <View className={styles.actionBar}>
            <View className={styles.actionItem} onClick={handleShare}>
              <Text className={styles.actionIcon}>📤</Text>
              <Text className={styles.actionText}>分享进度</Text>
            </View>
            <View className={styles.actionItem} onClick={handleDownloadReceipt}>
              <Text className={styles.actionIcon}>📄</Text>
              <Text className={styles.actionText}>电子回单</Text>
            </View>
            <View className={styles.actionItem} onClick={handleContact}>
              <Text className={styles.actionIcon}>📞</Text>
              <Text className={styles.actionText}>联系客服</Text>
            </View>
          </View>

          <View className={styles.timelineSection}>
            <Text className={styles.sectionTitleMain}>运输节点</Text>
            <Timeline nodes={searchResult.nodes} />
          </View>
        </View>
      ) : (
        <>
          {searchHistory.length > 0 && (
            <View className={styles.historySection}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>搜索历史</Text>
                <Button className={styles.clearBtn} onClick={handleClearHistory}>
                  清空
                </Button>
              </View>
              <View className={styles.historyTags}>
                {searchHistory.map((item, index) => (
                  <Button
                    key={index}
                    className={styles.historyTag}
                    onClick={() => handleSearch(item)}
                  >
                    {item}
                  </Button>
                ))}
              </View>
            </View>
          )}

          <View className={styles.historySection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>最近运单</Text>
            </View>
            {recentWaybills.length > 0 ? (
              <View className={styles.waybillList}>
                {recentWaybills.map((waybill) => (
                  <View
                    key={waybill.id}
                    className={styles.waybillCard}
                    onClick={() => handleViewDetail(waybill.waybillNo)}
                  >
                    <View className={styles.waybillHeader}>
                      <Text className={styles.waybillNo}>{waybill.waybillNo}</Text>
                      <StatusBadge status={waybill.status} text={waybill.statusText} />
                    </View>

                    <View className={styles.routeInfo}>
                      <Text className={styles.portName}>{waybill.startPort}</Text>
                      <Text className={styles.routeIcon}>→</Text>
                      <Text className={styles.portName}>{waybill.endPort}</Text>
                    </View>

                    <View className={styles.shipInfo}>
                      <Text className={styles.shipName}>🚢 {waybill.shipName}</Text>
                      <Text className={styles.etaInfo}>
                        预计 {waybill.estimatedArrivalTime.split(' ')[0]} 到达
                      </Text>
                    </View>

                    <View className={styles.cardFooter}>
                      <Text className={styles.containerNo}>箱号: {waybill.containerNo}</Text>
                      <Button className={styles.actionBtn}>查看详情</Button>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyWrapper}>
                <EmptyState
                  icon="📋"
                  title="暂无运单记录"
                  description="请输入运单号或扫码查询运输进度"
                />
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default WaybillPage;
