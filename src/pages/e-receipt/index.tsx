import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { WaybillInfo, EReceipt } from '@/types';

const EReceiptPage: React.FC = () => {
  const router = useRouter();
  const { generateEReceipt, getEReceiptByWaybillNo, getWaybillByNo, updateEReceiptFile } = useAppStore();

  const [receipt, setReceipt] = useState<EReceipt | null>(null);
  const [waybill, setWaybill] = useState<WaybillInfo | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleDownload = async () => {
    if (!receipt || !waybill || saving) return;

    setSaving(true);
    Taro.showLoading({ title: '正在生成回单...' });

    try {
      const receiptContent = `
╔══════════════════════════════════════════════════════════════╗
║                    集装箱运输电子回单                         ║
║                 ELECTRONIC RECEIPT                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  【回单基本信息】                                            ║
║  ─────────────────────────────────────────────────────────   ║
║  回单编号: ${receipt.id.padEnd(42)}║
║  运单号:   ${receipt.waybillNo.padEnd(42)}║
║  箱号:     ${receipt.containerNo.padEnd(42)}║
║  船名:     ${receipt.shipName.padEnd(42)}║
║  航线:     ${receipt.route.padEnd(42)}║
║  生成时间: ${receipt.generateTime.padEnd(42)}║
║                                                              ║
║  【货物信息】                                                ║
║  ─────────────────────────────────────────────────────────   ║
║  货物名称: ${receipt.cargoName.padEnd(43)}║
║  发货方:   ${receipt.sender.padEnd(43)}║
║  收货方:   ${receipt.receiver.padEnd(43)}║
║  货物重量: ${waybill.cargoWeight.padEnd(43)}║
║  货物体积: ${waybill.cargoVolume.padEnd(43)}║
║                                                              ║
║  【节点签收信息】                                            ║
║  ─────────────────────────────────────────────────────────   ║
${receipt.nodes.map(node => {
  const statusMark = node.status === 'completed' ? '✓' : node.status === 'current' ? '●' : '○';
  const timeStr = node.time || '-';
  return `║  ${statusMark} ${node.name.padEnd(12)} ${timeStr.padEnd(32)}║`;
}).join('\n')}
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  验证方式: 扫码验证                                          ║
║  本回单由系统自动生成，具有法律效力                          ║
╚══════════════════════════════════════════════════════════════╝
      `;

      const fs = Taro.getFileSystemManager();
      const filePath = `${Taro.env.USER_DATA_PATH}/receipt_${receipt.waybillNo}_${Date.now()}.txt`;
      fs.writeFileSync(filePath, receiptContent, 'utf8');

      try {
        const savedFile = await Taro.saveFile({ tempFilePath: filePath });
        updateEReceiptFile(receipt.id, savedFile.savedFilePath, 'text');

        setReceipt({
          ...receipt,
          filePath: savedFile.savedFilePath,
          fileType: 'text'
        });

        Taro.hideLoading();

        Taro.showModal({
          title: '电子回单生成成功',
          content: `回单已保存到本地\n\n文件路径: ${savedFile.savedFilePath}\n\n是否立即查看？`,
          confirmText: '立即查看',
          cancelText: '稍后查看',
          success: (res) => {
            if (res.confirm) {
              Taro.openDocument({
                filePath: savedFile.savedFilePath,
                showMenu: true,
                success: () => {
                  Taro.showToast({ title: '回单已打开', icon: 'success' });
                },
                fail: () => {
                  Taro.showToast({
                    title: '已保存，可在文件管理器中查看',
                    icon: 'none',
                    duration: 2000
                  });
                }
              });
            } else {
              Taro.showToast({
                title: '回单已保存',
                icon: 'success'
              });
            }
          }
        });
      } catch {
        fs.unlinkSync(filePath);
        Taro.hideLoading();
        Taro.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      Taro.hideLoading();
      console.error('Generate receipt failed:', error);
      Taro.showToast({
        title: '生成回单失败',
        icon: 'none'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenFile = () => {
    if (!receipt || !receipt.filePath) {
      Taro.showToast({
        title: '请先下载回单',
        icon: 'none'
      });
      return;
    }

    Taro.openDocument({
      filePath: receipt.filePath,
      showMenu: true,
      fail: () => {
        Taro.showToast({
          title: '无法打开文件',
          icon: 'none'
        });
      }
    });
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

      {receipt?.filePath && (
        <View className={styles.fileInfo}>
          <Text className={styles.fileInfoIcon}>📄</Text>
          <View className={styles.fileInfoContent}>
            <Text className={styles.fileInfoTitle}>回单已保存</Text>
            <Text className={styles.fileInfoPath}>{receipt.filePath}</Text>
          </View>
        </View>
      )}

      <View className={styles.actionButtons}>
        <Button className={`${styles.actionBtn} ${styles.secondary}`} onClick={handleShare}>
          <Text className={styles.btnIcon}>📤</Text>
          分享回单
        </Button>
        {receipt?.filePath ? (
          <Button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleOpenFile}>
            <Text className={styles.btnIcon}>📄</Text>
            打开回单
          </Button>
        ) : (
          <Button
            className={`${styles.actionBtn} ${styles.primary}`}
            onClick={handleDownload}
            disabled={saving}
          >
            <Text className={styles.btnIcon}>⬇️</Text>
            {saving ? '保存中...' : '下载回单'}
          </Button>
        )}
      </View>
    </View>
  );
};

export default EReceiptPage;
