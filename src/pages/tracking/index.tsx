import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Map } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh, eventCenter } from '@tarojs/taro';
import styles from './index.module.scss';
import SearchBar from '@/components/SearchBar';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { portCoordinates } from '@/data/tracking';
import type { ShipTracking, TrackPoint } from '@/types';

const TrackingPage: React.FC = () => {
  const {
    trackings,
    getTrackingByShipName,
    getTrackingByWaybillNo,
    getWaybillsByShipName
  } = useAppStore();

  const [trackingData, setTrackingData] = useState<ShipTracking | null>(trackings[0] || null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const handleSearchShip = (event: { shipName: string }) => {
      const result = getTrackingByShipName(event.shipName);
      if (result) {
        setTrackingData(result);
        setSearchKeyword(event.shipName);
      }
    };

    eventCenter.on('searchShip', handleSearchShip);
    return () => {
      eventCenter.off('searchShip', handleSearchShip);
    };
  }, [getTrackingByShipName]);

  useDidShow(() => {
    if (!trackingData && trackings.length > 0) {
      setTrackingData(trackings[0]);
    }
  });

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const mapConfig = useMemo(() => {
    if (!trackingData) return null;

    const { trackPoints, startPort, endPort, currentLatitude, currentLongitude } = trackingData;
    const startCoord = portCoordinates[startPort] || trackPoints[0];
    const endCoord = portCoordinates[endPort] || trackPoints[trackPoints.length - 1];

    const allPoints: TrackPoint[] = [
      { latitude: startCoord.latitude, longitude: startCoord.longitude, time: '' },
      ...trackPoints,
      { latitude: endCoord.latitude, longitude: endCoord.longitude, time: '' }
    ];

    const markers = [
      {
        id: 0,
        latitude: startCoord.latitude,
        longitude: startCoord.longitude,
        width: 32,
        height: 32,
        callout: {
          content: `起点: ${startPort}`,
          color: '#ffffff',
          fontSize: 12,
          borderRadius: 8,
          bgColor: '#0077C8',
          padding: 6,
          display: 'ALWAYS'
        }
      },
      {
        id: 1,
        latitude: endCoord.latitude,
        longitude: endCoord.longitude,
        width: 32,
        height: 32,
        callout: {
          content: `终点: ${endPort}`,
          color: '#ffffff',
          fontSize: 12,
          borderRadius: 8,
          bgColor: '#00B578',
          padding: 6,
          display: 'ALWAYS'
        }
      },
      {
        id: 2,
        latitude: currentLatitude,
        longitude: currentLongitude,
        width: 40,
        height: 40,
        callout: {
          content: `${trackingData.shipName}`,
          color: '#ffffff',
          fontSize: 12,
          borderRadius: 8,
          bgColor: '#FF7D00',
          padding: 6,
          display: 'ALWAYS'
        }
      }
    ];

    const polyline = [
      {
        points: allPoints.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
        color: '#0077C8',
        width: 4,
        dottedLine: false,
        arrowLine: true
      }
    ];

    const includePoints = allPoints.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude
    }));

    return {
      latitude: currentLatitude,
      longitude: currentLongitude,
      markers,
      polyline,
      includePoints,
      scale: 8
    };
  }, [trackingData]);

  const handleSearch = (value: string) => {
    const keyword = value.trim();
    if (!keyword) return;

    let result = getTrackingByShipName(keyword);
    if (!result) {
      result = getTrackingByWaybillNo(keyword);
    }

    if (result) {
      setTrackingData(result);
      setSearchKeyword(keyword);
      Taro.showToast({ title: '查询成功', icon: 'success' });
    } else {
      Taro.showToast({
        title: '未找到相关船舶',
        icon: 'none'
      });
    }
  };

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

  const handleViewWaybill = (waybillNo: string) => {
    Taro.switchTab({
      url: '/pages/waybill/index'
    });
    setTimeout(() => {
      Taro.eventCenter.trigger('searchWaybill', { waybillNo });
    }, 300);
  };

  const handleShipSelect = (ship: ShipTracking) => {
    setTrackingData(ship);
    setSearchKeyword('');
  };

  const formatCoords = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  };

  const relatedWaybills = useMemo(() => {
    if (!trackingData) return [];
    return getWaybillsByShipName(trackingData.shipName);
  }, [trackingData, getWaybillsByShipName]);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>节点轨迹</Text>
        <Text className={styles.pageSubtitle}>实时追踪船舶位置和航行轨迹</Text>
      </View>

      <View className={styles.searchSection}>
        <SearchBar
          placeholder="输入船名或运单号查询"
          value={searchKeyword}
          onSearch={handleSearch}
          onScan={handleScan}
        />
      </View>

      <View className={styles.shipTabs}>
        <ScrollView scrollX className={styles.shipTabScroll}>
          {trackings.map((ship) => (
          <View
            key={ship.id}
            className={`${styles.shipTab} ${trackingData?.id === ship.id ? styles.shipTabActive : ''}`}
            onClick={() => handleShipSelect(ship)}
          >
            <Text className={styles.shipTabText}>🚢 {ship.shipName}</Text>
          </View>
        ))}
        </ScrollView>
      </View>

      {trackingData && mapConfig ? (
        <>
          <View className={styles.mapContainer}>
            <Map
              className={styles.map}
              latitude={mapConfig.latitude}
              longitude={mapConfig.longitude}
              scale={mapConfig.scale}
              markers={mapConfig.markers}
              polyline={mapConfig.polyline}
              includePoints={mapConfig.includePoints}
              showLocation={true}
              enable3D={false}
              enableCompass={false}
              enableOverlooking={false}
              enableZoom={true}
              enableScroll={true}
              enableRotate={false}
              showScale={true}
            />
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

          {relatedWaybills.length > 0 && (
            <View className={styles.relatedWaybills}>
              <Text className={styles.sectionTitle}>相关运单</Text>
              <View className={styles.waybillList}>
                {relatedWaybills.map((waybill) => (
                  <View
                    key={waybill.id}
                    className={styles.waybillCard}
                    onClick={() => handleViewWaybill(waybill.waybillNo)}
                  >
                    <View className={styles.waybillHeader}>
                      <Text className={styles.waybillNo}>{waybill.waybillNo}</Text>
                      <Text className={styles.waybillCargo}>{waybill.cargoName}</Text>
                    </View>
                    <View className={styles.waybillFooter}>
                      <StatusBadge status={waybill.status} text={waybill.statusText} />
                      <Text className={styles.waybillArrow}>查看进度 →</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
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
