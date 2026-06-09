import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import SearchBar from '@/components/SearchBar';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { mockTracking, getTrackingByShipName, getTrackingByWaybillNo } from '@/data/tracking';
import type { ShipTracking } from '@/types';

const TrackingPage: React.FC = () => {
  const [trackingData, setTrackingData] = useState<ShipTracking | null>(null);
  const [allTrackings, setAllTrackings] = useState<ShipTracking[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    loadTrackings();
  }, []);

  useDidShow(() => {
    loadTrackings();
  });

  usePullDownRefresh(() => {
    loadTrackings();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const loadTrackings = () => {
    setAllTrackings(mockTracking);
    if (mockTracking.length > 0) {
      setTrackingData(mockTracking[0]);
    }
    console.log('[TrackingPage] 加载船舶轨迹数据');
  };

  const handleSearch = (value: string) => {
    let result = getTrackingByShipName(value);
    if (!result) {
      result = getTrackingByWaybillNo(value);
    }

    if (result) {
      setTrackingData(result);
      const index = mockTracking.findIndex(t => t.id === result!.id);
      if (index >= 0) {
        setSelectedIndex(index);
      }
      console.log('[TrackingPage] 查询成功:', value);
    } else {
      Taro.showToast({
        title: '未找到相关船舶',
        icon: 'none'
      });
      console.log('[TrackingPage] 未找到船舶:', value);
    }
  };

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        console.log('[TrackingPage] 扫码结果:', res.result);
        handleSearch(res.result);
      },
      fail: (err) => {
        console.error('[TrackingPage] 扫码失败:', err);
        Taro.showToast({
          title: '扫码失败，请重试',
          icon: 'none'
        });
      }
    });
  };

  const handleSelectTracking = (index: number) => {
    setSelectedIndex(index);
    setTrackingData(allTrackings[index]);
  };

  const handleViewWaybill = (waybillNo: string) => {
    Taro.switchTab({
      url: '/pages/waybill/index'
    });
    console.log('[TrackingPage] 查看运单:', waybillNo);
  };

  const formatCoords = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  };

  const calculateTrackLine = (point: { latitude: number; longitude: number }, index: number) => {
    if (index === 0) return null;
    const prev = trackingData!.trackPoints[index - 1];
    const dx = (point.longitude - prev.longitude) * 100;
    const dy = (point.latitude - prev.latitude) * 100;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { length: length * 5, angle };
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>节点轨迹</Text>
        <Text className={styles.pageSubtitle}>实时追踪船舶位置和航行轨迹</Text>
      </View>

      <View className={styles.searchSection}>
        <SearchBar
          placeholder="输入船名或运单号查询"
          onSearch={handleSearch}
          onScan={handleScan}
        />
      </View>

      {trackingData ? (
        <>
          <View className={styles.mapContainer}>
            <View className={styles.mapPlaceholder}>
              <Text className={styles.mapIcon}>🗺️</Text>
              <Text className={styles.mapHint}>地图加载中...</Text>

              {trackingData.trackPoints.map((point, index) => {
                const line = calculateTrackLine(point, index);
                const left = ((point.longitude - 114) / 8) * 100 + 10;
                const top = ((32 - point.latitude) / 3) * 100 + 20;

                return (
                  <React.Fragment key={index}>
                    {line && (
                      <View
                        className={styles.trackLine}
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${line.length}rpx`,
                          transform: `rotate(${line.angle}deg)`
                        }}
                      />
                    )}
                    {index === trackingData.trackPoints.length - 1 && (
                      <Text
                        className={styles.shipMarker}
                        style={{ left: `${left}%`, top: `${top}%` }}
                      >
                        🚢
                      </Text>
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          <View className={styles.infoCard}>
            <View className={styles.infoHeader}>
              <View>
                <Text className={styles.shipName}>🚢 {trackingData.shipName}</Text>
                <Text className={styles.mmsiText}>MMSI: {trackingData.mmsi}</Text>
              </View>
              <StatusBadge status={trackingData.status} text={trackingData.statusText} />
            </View>

            <View className={styles.infoGrid}>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>当前航速</Text>
                <Text className={styles.infoValue}>{trackingData.currentSpeed}</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>当前航向</Text>
                <Text className={styles.infoValue}>{trackingData.currentCourse}</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>当前位置</Text>
                <Text className={`${styles.infoValue} ${styles.infoValueHighlight}`}>
                  {formatCoords(trackingData.currentLatitude, trackingData.currentLongitude)}
                </Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>剩余距离</Text>
                <Text className={styles.infoValue}>{trackingData.distanceRemaining}</Text>
              </View>
            </View>

            <View className={styles.routeInfo}>
              <View className={styles.routeRow}>
                <View className={styles.portBlock}>
                  <Text className={styles.portName}>⛳ {trackingData.startPort}</Text>
                  <Text className={styles.portTime}>出发港</Text>
                </View>
                <View className={styles.routeDivider}>
                  <Text className={styles.routeArrow}>→</Text>
                  <Text className={styles.distanceText}>{trackingData.distanceRemaining}</Text>
                </View>
                <View className={styles.portBlock}>
                  <Text className={styles.portName}>🎯 {trackingData.endPort}</Text>
                  <Text className={styles.portTime}>预计到达 {trackingData.estimatedArrivalTime}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className={styles.trackHistory}>
            <Text className={styles.sectionTitle}>航行轨迹</Text>
            <View className={styles.trackList}>
              {[...trackingData.trackPoints].reverse().map((point, index) => (
                <View key={index} className={styles.trackItem}>
                  <View className={styles.trackDot} />
                  <View className={styles.trackInfo}>
                    <Text className={styles.trackTime}>{point.time}</Text>
                    <Text className={styles.trackCoords}>
                      {formatCoords(point.latitude, point.longitude)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.relatedWaybills}>
            <Text className={styles.sectionTitle}>相关运单</Text>
            <View>
              {trackingData.waybillNos.map((waybillNo, index) => (
                <Text
                  key={index}
                  className={styles.waybillTag}
                  onClick={() => handleViewWaybill(waybillNo)}
                >
                  {waybillNo} →
                </Text>
              ))}
            </View>
          </View>
        </>
      ) : (
        <View className={styles.emptyWrapper}>
          <EmptyState
            icon="🚢"
            title="暂无船舶轨迹"
            description="请输入船名或运单号查询船舶轨迹"
          />
        </View>
      )}
    </ScrollView>
  );
};

export default TrackingPage;
