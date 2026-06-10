import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { WaybillInfo, EReceipt } from '@/types';

const EReceiptPage: React.FC = () => {
  const router = useRouter();
  const { generateEReceipt, getEReceiptByWaybillNo, getWaybillByNo } = useAppStore();

  const [receipt, setReceipt] = useState<EReceipt | null>(null);
  const [waybill, setWaybill] = useState<WaybillInfo | null>(null);

  useEffect(() => {
    const waybillNo = router.params.waybillNo as string;
    if (!waybillNo) {
      Taro.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => Taro.navigateBack(), 1500);
      return;
    }

    const waybillInfo = getWaybillByNo(waybillNo);
    if (!waybillInfo) {
      Taro.showToast({ title: '运单不存在', icon: 'none' });
      setTimeout(() => Taro.navigateBack(), 1500);
      return;
    }

    setWaybill(waybillInfo);
    const existingReceipt = getEReceiptByWaybillNo(waybillNo);
    if (existingReceipt) {
      setReceipt(existingReceipt);
    } else {
      const newReceipt = generateEReceipt(waybillInfo);
      setReceipt(newReceipt);
    }
  }, [router.params, generateEReceipt, getEReceiptByWaybillNo, getWaybillByNo]);

  const handleShare = () => {
    if (!receipt) return;
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    Taro.showToast({
      title: '请点击右上角分享',
      icon: 'none'
    });
  };

  const handleDownload = () => {
    if (!receipt) return;
    Taro.showLoading({ title: '正在生成...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showModal({
        title: '电子回单',
        content: `电子回单已生成\n\n回单编号：${receipt.id}\n运单号：${receipt.waybillNo}\n生成时间：${receipt.generateTime}\n\n可在"我的回单"中查看历史记录`,
        showCancel: false,
        confirmText: '知道了'
      });
    }, 1500);
  };

  const getNodeStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return '';
      case 'current':
        return 'current';
      default:
        return 'pending';
    }
  };

  if (!receipt || !waybill) {
    return (
      <View className={styles.page}>
        <View style={{ textAlign: 'center', padding: '100rpx 0' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.receiptCard}>
        <View className={styles.receiptHeader}>
          <Text className={styles.receiptTitle}>📋 集装箱运输电子回单</Text>
          <Text className={styles.receiptSubtitle}>ELECTRONIC RECEIPT</Text>
        </View>

        <View className={styles.receiptBody}>
          <View className={styles.receiptInfo}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>运单号</Text>
              <Text className={styles.infoValue}>{receipt.waybillNo}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>箱号</Text>
              <Text className={styles.infoValue}>{receipt.containerNo}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>船名</Text>
              <Text className={styles.infoValue}>{receipt.shipName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>航线</Text>
              <Text className={styles.infoValue}>{receipt.route}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>货物名称</Text>
              <Text className={styles.infoValue}>{receipt.cargoName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>发货方</Text>
              <Text className={styles.infoValue}>{receipt.sender}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>收货方</Text>
              <Text className={styles.infoValue}>{receipt.receiver}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>货物重量</Text>
              <Text className={styles.infoValue}>{waybill.cargoWeight}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>货物体积</Text>
              <Text className={styles.infoValue}>{waybill.cargoVolume}</Text>
            </View>
          </View>

          <View className={styles.nodesSection}>
            <Text className={styles.sectionTitle}>节点签收信息</Text>
            <View className={styles.nodeList}>
              {receipt.nodes.map((node) => (
                <View key={node.id} className={styles.nodeItem}>
                  <View className={`${styles.nodeDot} ${getNodeStatusClass(node.status)}`} />
                  <View className={styles.nodeContent}>
                    <Text className={styles.nodeName}>{node.name}</Text>
                    {node.location && (
                      <Text className={styles.nodeInfo}>地点：{node.location}</Text>
                    )}
                    {node.operator && (
                      <Text className={styles.nodeInfo}>操作人：{node.operator}</Text>
                    )}
                    {node.remark && (
                      <Text className={styles.nodeInfo}>备注：{node.remark}</Text>
                    )}
                    {node.time && (
                      <Text className={styles.nodeTime}>签收时间：{node.time}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.receiptFooter}>
          <View className={styles.footerRow}>
            <Text className={styles.footerLabel}>回单编号</Text>
            <Text className={styles.footerValue}>{receipt.id}</Text>
          </View>
          <View className={styles.footerRow}>
            <Text className={styles.footerLabel}>生成时间</Text>
            <Text className={styles.footerValue}>{receipt.generateTime}</Text>
          </View>
          <View className={styles.footerRow}>
            <Text className={styles.footerLabel}>验证方式</Text>
            <Text className={styles.footerValue}>扫码验证</Text>
          </View>
        </View>
      </View>

      <View className={styles.qrSection}>
        <Text className={styles.qrTitle}>📱 扫码验证真伪</Text>
        <View className={styles.qrCode}>
          <View className={styles.qrPlaceholder}>
            <Text className={styles.qrIcon}>🔐</Text>
          </View>
        </View>
        <Text className={styles.qrHint}>收货人可扫描此二维码验证回单真实性</Text>
      </View>

      <View className={styles.actionButtons}>
        <Button className={`${styles.actionBtn} ${styles.secondary}`} onClick={handleShare}>
          <Text className={styles.btnIcon}>📤</Text>
          分享回单
        </Button>
        <Button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleDownload}>
          <Text className={styles.btnIcon}>⬇️</Text>
          下载回单
        </Button>
      </View>
    </View>
  );
};

export default EReceiptPage;
