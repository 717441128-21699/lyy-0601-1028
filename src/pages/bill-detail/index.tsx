import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { BillSummary, ExpenseInfo, PaymentRecord } from '@/types';

const BillDetailPage: React.FC = () => {
  const router = useRouter();
  const {
    getBillSummaryByWaybillNo,
    generateBillSummary,
    getExpensesByWaybillNo,
    getWaybillByNo,
    updateBillFile,
    updateExpensePayment,
    refreshBillSummaries
  } = useAppStore();

  const [bill, setBill] = useState<BillSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseInfo[]>([]);
  const [expensesExpanded, setExpensesExpanded] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [paying, setPaying] = useState(false);

  const waybillNo = router.params.waybillNo as string;

  const loadData = useCallback(() => {
    if (!waybillNo) {
      Taro.showToast({ title: '参数错误', icon: 'none' });
      return;
    }

    let billData = generateBillSummary(waybillNo, true);
    if (billData) {
      setBill(billData);
    }

    const expenseData = getExpensesByWaybillNo(waybillNo);
    setExpenses(expenseData);
  }, [waybillNo, generateBillSummary, getExpensesByWaybillNo]);

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    loadData();
    Taro.stopPullDownRefresh();
  });

  const handleDownloadBill = async () => {
    if (!bill || downloading) return;

    setDownloading(true);
    try {
      const waybill = getWaybillByNo(waybillNo);
      const billContent = `
水路运输账单明细
================
账单编号：${bill.id}
运单号：${bill.waybillNo}
船名：${bill.shipName}
航线：${bill.route}
起运港：${bill.startPort}
目的港：${bill.endPort}
生成时间：${bill.generateTime || new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}

费用明细：
${expenses.map(e => `- ${e.statusText}：¥${e.totalAmount.toFixed(2)}`).join('\n')}

付款记录：
${bill.paymentRecords.length === 0 ? '暂无付款记录' : bill.paymentRecords.map(p => `- ${p.paymentTime} ${p.paymentMethod}：¥${p.amount.toFixed(2)}`).join('\n')}

汇总：
- 总金额：¥${bill.totalAmount.toFixed(2)}
- 已支付：¥${bill.paidAmount.toFixed(2)}
- 待支付：¥${bill.unpaidAmount.toFixed(2)}
- 状态：${bill.statusText}
      `;

      const fs = Taro.getFileSystemManager();
      const filePath = `${Taro.env.USER_DATA_PATH}/bill_${bill.waybillNo}.txt`;

      try {
        fs.writeFileSync(filePath, billContent, 'utf8');
        updateBillFile(bill.id, filePath);
        Taro.showModal({
          title: '下载成功',
          content: `账单已保存至：${filePath}\n\n是否打开查看？`,
          success: (res) => {
            if (res.confirm) {
              try {
                Taro.openDocument({
                  filePath,
                  showMenu: true,
                  fail: () => {
                    Taro.showToast({ title: '请使用支持的应用打开', icon: 'none' });
                  }
                });
              } catch (e) {
                Taro.showToast({ title: '打开失败，请在文件管理器中查看', icon: 'none' });
              }
            }
          }
        });
      } catch (writeError) {
        console.error('[BillDetail] Write file failed:', writeError);
        Taro.showModal({
          title: '账单明细',
          content: billContent,
          showCancel: false
        });
      }
    } catch (error) {
      console.error('[BillDetail] Download bill failed:', error);
      Taro.showToast({ title: '下载失败，请重试', icon: 'none' });
    } finally {
      setDownloading(false);
    }
  };

  const handleViewVoucher = (voucherUrl: string) => {
    Taro.previewImage({
      urls: [voucherUrl],
      current: voucherUrl
    });
  };

  const handlePayment = async () => {
    if (!bill || paying || bill.status === 'paid') return;

    Taro.showModal({
      title: '确认支付',
      content: `确定支付 ¥${bill.unpaidAmount.toFixed(2)} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          setPaying(true);
          try {
            const voucherUrl = 'https://picsum.photos/id/225/400/400';

            for (const expense of expenses) {
              if (expense.unpaidAmount > 0) {
                updateExpensePayment(
                  expense.id,
                  expense.unpaidAmount,
                  '微信支付',
                  voucherUrl
                );
              }
            }

            refreshBillSummaries();
            Taro.showToast({ title: '支付成功', icon: 'success' });
            setTimeout(() => {
              loadData();
            }, 100);
          } catch (error) {
            console.error('[BillDetail] Payment failed:', error);
            Taro.showToast({ title: '支付失败，请重试', icon: 'none' });
          } finally {
            setPaying(false);
          }
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      paid: '#00B42A',
      partial: '#FF7D00',
      unpaid: '#F53F3F'
    };
    return colorMap[status] || '#86909C';
  };

  if (!bill) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>加载中...</View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.billNo}>账单编号：{bill.id}</Text>
        <Text className={styles.waybillNo}>运单号：{bill.waybillNo}</Text>
        <View className={styles.shipInfo}>
          <Text>{bill.shipName}</Text>
          <Text>{bill.route}</Text>
        </View>
        <View className={styles.amountSection}>
          <View>
            <View className={styles.amountItem}>
              <Text className={styles.amountLabel}>总金额</Text>
              <Text className={styles.amountValue}>¥{bill.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
          <View>
            <View className={styles.amountItem}>
              <Text className={styles.amountLabel}>已支付</Text>
              <Text className={classnames(styles.amountValue, styles.paid)}>¥{bill.paidAmount.toFixed(2)}</Text>
            </View>
          </View>
          <View>
            <View className={styles.amountItem}>
              <Text className={styles.amountLabel}>待支付</Text>
              <Text className={classnames(styles.amountValue, styles.unpaid)}>¥{bill.unpaidAmount.toFixed(2)}</Text>
            </View>
          </View>
          <View
            className={styles.statusBadge}
            style={{ backgroundColor: `${getStatusColor(bill.status)}30` }}
          >
            <Text style={{ color: getStatusColor(bill.status) }}>
              {bill.statusText}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.billInfo}>
          <View className={styles.billInfoRow}>
            <Text className={styles.billInfoLabel}>起运港</Text>
            <Text className={styles.billInfoValue}>{bill.startPort}</Text>
          </View>
          <View className={styles.billInfoRow}>
            <Text className={styles.billInfoLabel}>目的港</Text>
            <Text className={styles.billInfoValue}>{bill.endPort}</Text>
          </View>
          <View className={styles.billInfoRow}>
            <Text className={styles.billInfoLabel}>创建时间</Text>
            <Text className={styles.billInfoValue}>{bill.createTime}</Text>
          </View>
          <View className={styles.billInfoRow}>
            <Text className={styles.billInfoLabel}>到期时间</Text>
            <Text className={styles.billInfoValue}>{bill.dueDate}</Text>
          </View>
          {bill.generateTime && (
            <View className={styles.billInfoRow}>
              <Text className={styles.billInfoLabel}>账单生成时间</Text>
              <Text className={styles.billInfoValue}>{bill.generateTime}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <View className={styles.dot} />
            <Text>费用明细</Text>
          </View>
          <Text
            className={styles.expandBtn}
            onClick={() => setExpensesExpanded(!expensesExpanded)}
          >
            {expensesExpanded ? '收起' : '展开'}
          </Text>
        </View>

        {expensesExpanded && (
          <View className={styles.expenseList}>
            {expenses.map((expense) => (
              <View key={expense.id} className={styles.expenseItem}>
                <View>
                  <Text className={styles.expenseName}>{expense.statusText}</Text>
                  {expense.items.map((item) => (
                    <Text key={item.id} className={styles.expenseRemark}>
                      {item.name}：¥{item.amount.toFixed(2)}
                    </Text>
                  ))}
                </View>
                <View style={{ textAlign: 'right' }}>
                  <Text className={styles.expenseAmount}>¥{expense.totalAmount.toFixed(2)}</Text>
                  <Text
                    className={styles.expenseRemark}
                    style={{ color: getStatusColor(expense.status) }}
                  >
                    {expense.statusText}
                  </Text>
                </View>
              </View>
            ))}
            <View className={styles.totalRow}>
              <Text className={styles.totalLabel}>合计</Text>
              <Text className={styles.totalAmount}>¥{bill.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <View className={styles.dot} />
            <Text>付款记录</Text>
          </View>
        </View>

        {bill.paymentRecords.length === 0 ? (
          <View className={styles.noPayment}>暂无付款记录</View>
        ) : (
          <View className={styles.paymentTimeline}>
            {bill.paymentRecords.map((record: PaymentRecord) => (
              <View key={record.id} className={styles.paymentItem}>
                <View className={styles.paymentDot} />
                <View className={styles.paymentHeader}>
                  <Text className={styles.paymentAmount}>+¥{record.amount.toFixed(2)}</Text>
                  <Text className={styles.paymentMethod}>{record.paymentMethod}</Text>
                </View>
                <Text className={styles.paymentTime}>{record.paymentTime}</Text>
                {record.voucherUrl && (
                  <View className={styles.paymentVoucher}>
                    <Text className={styles.voucherTitle}>付款凭证</Text>
                    <View className={styles.voucherSection}>
                      <View
                        className={styles.voucherItem}
                        onClick={() => handleViewVoucher(record.voucherUrl)}
                      >
                        <Image
                          className={styles.voucherImg}
                          src={record.voucherUrl}
                          mode='aspectFill'
                        />
                        <Text className={styles.voucherLabel}>点击查看</Text>
                      </View>
                    </View>
                  </View>
                )}
                {record.remark && (
                  <Text className={styles.expenseRemark}>备注：{record.remark}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {bill.billFileUrl && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <View className={styles.dot} />
              <Text>已下载账单</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>文件路径</Text>
            <Text className={styles.infoValue}>{bill.billFileUrl}</Text>
          </View>
        </View>
      )}

      <View className={styles.footer}>
        <View
          className={classnames(styles.btn, styles.btnSecondary)}
          onClick={handleDownloadBill}
        >
          {downloading ? '生成中...' : '下载账单'}
        </View>
        {bill.status !== 'paid' && (
          <View
            className={classnames(styles.btn, styles.btnPrimary, paying && styles.btnDisabled)}
            onClick={!paying ? handlePayment : undefined}
          >
            {paying ? '支付中...' : `去支付 ¥${bill.unpaidAmount.toFixed(2)}`}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default BillDetailPage;
