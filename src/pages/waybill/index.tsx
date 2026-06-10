import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, {
  useDidShow,
  usePullDownRefresh,
  useRouter,
  eventCenter,
  useShareAppMessage,
  useShareTimeline
} from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import SearchBar from '@/components/SearchBar';
import StatusBadge from '@/components/StatusBadge';
import Timeline from '@/components/Timeline';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import type { WaybillInfo } from '@/types';

const WaybillPage: React.FC = () => {
  const router = useRouter();
  const {
    waybills,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    getWaybillByNo,
    generateEReceipt
  } = useAppStore();

  const [searchResult, setSearchResult] = useState<WaybillInfo | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const recentWaybills = waybills.slice(0, 3);

  const handleSearch = useCallback((waybillNo: string) => {
    const keyword = waybillNo.trim();
    if (!keyword) return;

    setLoading(true);
    setTimeout(() => {
      const result = getWaybillByNo(keyword);
      if (result) {
        setSearchResult(result);
        setSearchKeyword(keyword);
        addSearchHistory(keyword);
        Taro.showToast({ title: '查询成功', icon: 'success' });
      } else {
        Taro.showToast({
          title: '未找到该运单',
          icon: 'none'
        });
      }
      setLoading(false);
    }, 300);
  }, [getWaybillByNo, addSearchHistory]);

  useEffect(() => {
    const waybillNo = router.params.waybillNo as string;
    const fromShare = router.params.shared as string;

    if (waybillNo) {
      handleSearch(waybillNo);
      if (fromShare === '1') {
        setTimeout(() => {
          Taro.showToast({
            title: '已为您自动查询运单',
            icon: 'success',
            duration: 2000
          });
        }, 500);
      }
    }

    const handleSearchFromTracking = (event: { waybillNo: string }) => {
      handleSearch(event.waybillNo);
    };

    eventCenter.on('searchWaybill', handleSearchFromTracking);
    return () => {
      eventCenter.off('searchWaybill', handleSearchFromTracking);
    };
  }, [router.params, handleSearch]);

  useDidShow(() => {
    const waybillNo = router.params.waybillNo as string;
    if (waybillNo && !searchResult) {
      handleSearch(waybillNo);
    }
  });

  usePullDownRefresh(() => {
    if (searchResult) {
      const result = getWaybillByNo(searchResult.waybillNo);
      if (result) {
        setSearchResult(result);
      }
    }
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        handleSearch(res.result);
      },
      fail: () => {
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
          clearSearchHistory();
        }
      }
    });
  };

  const handleShare = () => {
    if (!searchResult) return;

    const shareUrl = `/pages/waybill/index?waybillNo=${searchResult.waybillNo}&shared=1`;

    if (process.env.TARO_ENV === 'h5') {
      const fullUrl = `${window.location.origin}${window.location.pathname}#${shareUrl}`;
      Taro.setClipboardData({
        data: fullUrl,
        success: () => {
          Taro.showModal({
            title: '分享链接已复制',
            content: `链接已复制到剪贴板，收货方打开后可直接查看运单进度和电子回单。\n\n链接：${fullUrl}`,
            showCancel: false
          });
        }
      });
    } else {
      Taro.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
      Taro.showToast({
        title: '请点击右上角分享',
        icon: 'none'
      });
    }
  };

  const onShareAppMessage = () => {
    if (!searchResult) {
      return {
        title: '水路运输货主查询',
        path: '/pages/waybill/index'
      };
    }
    return {
      title: `运单${searchResult.waybillNo}运输进度`,
      path: `/pages/waybill/index?waybillNo=${searchResult.waybillNo}&shared=1`,
      desc: `${searchResult.startPort}→${searchResult.endPort}，当前状态：${searchResult.statusText}`
    };
  };

  const onShareTimeline = () => {
    if (!searchResult) {
      return {
        title: '水路运输货主查询'
      };
    }
    return {
      title: `运单${searchResult.waybillNo}运输进度 - ${searchResult.statusText}`,
      query: `waybillNo=${searchResult.waybillNo}&shared=1`
    };
  };

  const handleViewReceipt = () => {
    if (!searchResult) return;
    generateEReceipt(searchResult);
    Taro.navigateTo({
      url: `/pages/e-receipt/index?waybillNo=${searchResult.waybillNo}`
    });
  };

  const handleContact = () => {
    Taro.navigateTo({
      url: '/pages/customer-service/index'
    });
  };

  const handleViewDetail = (waybillNo: string) => {
    handleSearch(waybillNo);
  };

  const handleViewTracking = (shipName: string) => {
    Taro.switchTab({
      url: '/pages/tracking/index'
    });
    setTimeout(() => {
      eventCenter.trigger('searchShip', { shipName });
    }, 300);
  };

  const handleBackToSearch = () => {
    setSearchResult(null);
    setSearchKeyword('');
  };

  useShareAppMessage(onShareAppMessage);
  useShareTimeline(onShareTimeline);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>运单查询</Text>
        <Text className={styles.pageSubtitle}>输入运单号或扫码查询运输进度</Text>
      </View>

      <View className={styles.searchSection}>
        <SearchBar
          placeholder="请输入运单号，如 SY202406100001"
          value={searchKeyword}
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
              <View className={styles.infoItem} onClick={() => handleViewTracking(searchResult.shipName)}>
                <Text className={styles.infoLabel}>船名</Text>
                <Text className={`${styles.infoValue} ${styles.infoValueLink}`}>
                  🚢 {searchResult.shipName} →
                </Text>
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

            <View className={styles.extraInfo}>
              <View className={styles.extraRow}>
                <Text className={styles.extraLabel}>发货方</Text>
                <Text className={styles.extraValue}>{searchResult.sender}</Text>
              </View>
              <View className={styles.extraRow}>
                <Text className={styles.extraLabel}>收货方</Text>
                <Text className={styles.extraValue}>{searchResult.receiver}</Text>
              </View>
              <View className={styles.extraRow}>
                <Text className={styles.extraLabel}>货物信息</Text>
                <Text className={styles.extraValue}>
                  {searchResult.cargoWeight} / {searchResult.cargoVolume}
                </Text>
              </View>
            </View>
          </View>

          <View className={styles.actionBar}>
            <View className={styles.actionItem} onClick={handleShare}>
              <Text className={styles.actionIcon}>📤</Text>
              <Text className={styles.actionText}>分享进度</Text>
            </View>
            <View className={styles.actionItem} onClick={handleViewReceipt}>
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
