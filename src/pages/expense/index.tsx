import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { mockExpenses, expenseTypeMap } from '@/data/expense';
import type { ExpenseInfo } from '@/types';

const ExpensePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [expenses, setExpenses] = useState<ExpenseInfo[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseInfo[]>([]);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadExpenses();
  }, []);

  useDidShow(() => {
    loadExpenses();
  });

  usePullDownRefresh(() => {
    loadExpenses();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const loadExpenses = () => {
    setExpenses(mockExpenses);
    filterExpenses(mockExpenses, activeTab);
    calculateStatistics(mockExpenses);
    console.log('[ExpensePage] 加载费用数据');
  };

  const calculateStatistics = (data: ExpenseInfo[]) => {
    const unpaid = data.filter(e => e.status === 'unpaid' || e.status === 'partial').reduce((sum, e) => sum + e.unpaidAmount, 0);
    const paid = data.reduce((sum, e) => sum + e.paidAmount, 0);
    const total = data.reduce((sum, e) => sum + e.totalAmount, 0);
    setTotalUnpaid(unpaid);
    setTotalPaid(paid);
    setTotalAmount(total);
  };

  const filterExpenses = (data: ExpenseInfo[], tab: string) => {
    let filtered = data;
    if (tab === 'unpaid') {
      filtered = data.filter(e => e.status === 'unpaid' || e.status === 'partial');
    } else if (tab === 'paid') {
      filtered = data.filter(e => e.status === 'paid');
    }
    setFilteredExpenses(filtered);
  };

  const handleTabChange = (tab: 'all' | 'unpaid' | 'paid') => {
    setActiveTab(tab);
    filterExpenses(expenses, tab);
  };

  const handlePay = (expense: ExpenseInfo) => {
    Taro.showModal({
      title: '确认支付',
      content: `确认支付 ¥${expense.unpaidAmount.toFixed(2)}？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '支付中...' });
          setTimeout(() => {
            Taro.hideLoading();
            const updated = expenses.map(e =>
              e.id === expense.id
                ? { ...e, status: 'paid' as const, statusText: '已支付', paidAmount: e.totalAmount, unpaidAmount: 0 }
                : e
            );
            setExpenses(updated);
            filterExpenses(updated, activeTab);
            calculateStatistics(updated);
            Taro.showToast({
              title: '支付成功',
              icon: 'success'
            });
            console.log('[ExpensePage] 支付成功:', expense.waybillNo);
          }, 1500);
        }
      }
    });
  };

  const handleViewDetail = (expense: ExpenseInfo) => {
    Taro.showToast({
      title: '查看费用详情',
      icon: 'none'
    });
    console.log('[ExpensePage] 查看费用详情:', expense.waybillNo);
  };

  const handleDownloadInvoice = (expense: ExpenseInfo) => {
    Taro.showLoading({ title: '正在生成...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '发票已下载',
        icon: 'success'
      });
      console.log('[ExpensePage] 下载发票:', expense.waybillNo);
    }, 1000);
  };

  const getTypeColor = (type: string) => {
    return expenseTypeMap[type]?.color || '#86909C';
  };

  const getTypeLabel = (type: string) => {
    return expenseTypeMap[type]?.label || '其他';
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>费用明细</Text>
        <Text className={styles.pageSubtitle}>查看和管理您的费用账单</Text>
      </View>

      <View className={styles.summaryCard}>
        <Text className={styles.summaryLabel}>待支付金额</Text>
        <Text className={styles.summaryAmount}>{formatAmount(totalUnpaid)}</Text>
        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemLabel}>已支付</Text>
            <Text className={styles.summaryItemValue}>{formatAmount(totalPaid)}</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemLabel}>总金额</Text>
            <Text className={styles.summaryItemValue}>{formatAmount(totalAmount)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classNames(styles.tabItem, { [styles.active]: activeTab === 'all' })}
          onClick={() => handleTabChange('all')}
        >
          全部
        </Text>
        <Text
          className={classNames(styles.tabItem, { [styles.active]: activeTab === 'unpaid' })}
          onClick={() => handleTabChange('unpaid')}
        >
          待支付
        </Text>
        <Text
          className={classNames(styles.tabItem, { [styles.active]: activeTab === 'paid' })}
          onClick={() => handleTabChange('paid')}
        >
          已支付
        </Text>
      </View>

      {filteredExpenses.length > 0 ? (
        <View className={styles.expenseList}>
          {filteredExpenses.map(expense => (
            <View key={expense.id} className={styles.expenseCard}>
              <View className={styles.cardHeader}>
                <View>
                  <Text className={styles.waybillNo}>运单号: {expense.waybillNo}</Text>
                  <Text className={styles.createTime}>账单日期: {expense.createTime}</Text>
                </View>
                <StatusBadge status={expense.status} text={expense.statusText} />
              </View>

              <View className={styles.amountRow}>
                <Text className={styles.amountLabel}>账单金额</Text>
                <Text className={styles.amountValue}>{formatAmount(expense.totalAmount)}</Text>
              </View>

              <View className={styles.itemList}>
                {expense.items.map(item => (
                  <View key={item.id}>
                    <View className={styles.itemRow}>
                      <View className={styles.itemLeft}>
                        <Text
                          className={styles.itemTag}
                          style={{
                            backgroundColor: `${getTypeColor(item.type)}15`,
                            color: getTypeColor(item.type)
                          }}
                        >
                          {getTypeLabel(item.type)}
                        </Text>
                        <Text className={styles.itemName}>{item.name}</Text>
                      </View>
                      <Text className={styles.itemAmount}>{formatAmount(item.amount)}</Text>
                    </View>
                    {item.remark && (
                      <Text className={styles.itemRemark}>备注: {item.remark}</Text>
                    )}
                  </View>
                ))}
              </View>

              <View className={styles.cardFooter}>
                <View>
                  <Text
                    className={classNames(styles.dueInfo, {
                      [styles.dueWarning]: expense.status === 'unpaid' || expense.status === 'partial'
                    })}
                  >
                    {expense.status === 'paid'
                      ? `已支付: ${formatAmount(expense.paidAmount)}`
                      : `待支付: ${formatAmount(expense.unpaidAmount)} | 截止: ${expense.dueDate}`}
                  </Text>
                </View>
                <View style={{ display: 'flex', gap: '16rpx' }}>
                  <Button
                    className={classNames(styles.actionBtn, styles.secondary)}
                    onClick={() => handleDownloadInvoice(expense)}
                  >
                    发票
                  </Button>
                  {(expense.status === 'unpaid' || expense.status === 'partial') && (
                    <Button
                      className={classNames(styles.actionBtn, styles.primary)}
                      onClick={() => handlePay(expense)}
                    >
                      去支付
                    </Button>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyWrapper}>
          <EmptyState
            icon="💰"
            title="暂无费用记录"
            description={activeTab === 'all' ? '暂无费用账单' : activeTab === 'unpaid' ? '暂无待支付费用' : '暂无已支付费用'}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default ExpensePage;
