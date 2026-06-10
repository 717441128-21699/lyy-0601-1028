import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Picker } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { expenseTypeMap } from '@/data/expense';
import type { ExpenseInfo } from '@/types';

const ExpensePage: React.FC = () => {
  const { expenses, waybills, updateExpensePayment, getExpensesByWaybillNo, getBillSummaries, generateBillSummary, refreshBillSummaries } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchWaybillNo, setSearchWaybillNo] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedWaybill, setSelectedWaybill] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const waybillOptions = useMemo(() => {
    return ['全部运单', ...waybills.map(w => w.waybillNo)];
  }, [waybills]);

  const statistics = useMemo(() => {
    const unpaid = expenses
      .filter(e => e.status === 'unpaid' || e.status === 'partial')
      .reduce((sum, e) => sum + e.unpaidAmount, 0);
    const paid = expenses.reduce((sum, e) => sum + e.paidAmount, 0);
    const total = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
    return { totalUnpaid: unpaid, totalPaid: paid, totalAmount: total };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let data = expenses;

    if (activeTab === 'unpaid') {
      data = data.filter(e => e.status === 'unpaid' || e.status === 'partial');
    } else if (activeTab === 'paid') {
      data = data.filter(e => e.status === 'paid');
    }

    if (selectedWaybill && selectedWaybill !== '全部运单') {
      data = data.filter(e => e.waybillNo === selectedWaybill);
    }

    if (searchWaybillNo.trim()) {
      data = getExpensesByWaybillNo(searchWaybillNo.trim());
    }

    return data.sort((a, b) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  }, [expenses, activeTab, selectedWaybill, searchWaybillNo, getExpensesByWaybillNo]);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const handleTabChange = (tab: 'all' | 'unpaid' | 'paid') => {
    setActiveTab(tab);
  };

  const handleSearch = () => {
    if (searchWaybillNo.trim()) {
      const result = getExpensesByWaybillNo(searchWaybillNo.trim());
      if (result.length === 0) {
        Taro.showToast({
          title: '未找到该运单的费用',
          icon: 'none'
        });
      }
    }
  };

  const handleResetFilter = () => {
    setSelectedWaybill('');
    setSearchWaybillNo('');
    Taro.showToast({ title: '已重置', icon: 'success' });
  };

  const handlePay = async (expense: ExpenseInfo) => {
    if (payingId) return;

    Taro.showModal({
      title: '确认支付',
      content: `确认支付 ¥${expense.unpaidAmount.toFixed(2)}？`,
      success: async (res) => {
        if (res.confirm) {
          setPayingId(expense.id);
          Taro.showLoading({ title: '支付中...' });

          try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const voucherUrl = `https://example.com/voucher/${expense.id}_${Date.now()}.png`;

            updateExpensePayment(
              expense.id,
              expense.unpaidAmount,
              '微信支付',
              voucherUrl
            );

            Taro.hideLoading();
            Taro.showToast({
              title: '支付成功',
              icon: 'success'
            });
          } catch (error) {
            Taro.hideLoading();
            Taro.showToast({
              title: '支付失败，请重试',
              icon: 'none'
            });
          } finally {
            setPayingId(null);
          }
        }
      }
    });
  };

  const handleViewVoucher = async (expense: ExpenseInfo) => {
    if (!expense.paymentVoucher) {
      Taro.showToast({
        title: '暂无付款凭证',
        icon: 'none'
      });
      return;
    }

    try {
      if (expense.paymentVoucher.startsWith('http')) {
        Taro.previewImage({
          urls: [expense.paymentVoucher],
          current: expense.paymentVoucher
        });
      } else {
        const savedPath = await Taro.saveFile({ tempFilePath: expense.paymentVoucher });
        Taro.openDocument({
          filePath: savedPath.savedFilePath,
          showMenu: true,
          success: () => {
            Taro.showToast({ title: '凭证已打开', icon: 'success' });
          },
          fail: () => {
            Taro.previewImage({
              urls: [expense.paymentVoucher],
              current: expense.paymentVoucher
            });
          }
        });
      }
    } catch {
      Taro.previewImage({
        urls: [expense.paymentVoucher],
        current: expense.paymentVoucher
      });
    }
  };

  const handleDownloadBill = async (expense: ExpenseInfo) => {
    Taro.showLoading({ title: '正在生成账单...' });

    try {
      const billContent = `
=========================================
          集装箱运输费用账单
=========================================

【账单基本信息】
账单编号: ${expense.id}
运单号: ${expense.waybillNo}
账单日期: ${expense.createTime}
支付状态: ${expense.statusText}

【费用明细】
${expense.items.map((item, idx) => `
${idx + 1}. ${getTypeLabel(item.type)} - ${item.name}
   金额: ¥${item.amount.toFixed(2)}
   ${item.remark ? `备注: ${item.remark}` : ''}
`).join('')}

【费用汇总】
账单总金额: ¥${expense.totalAmount.toFixed(2)}
已支付金额: ¥${expense.paidAmount.toFixed(2)}
待支付金额: ¥${expense.unpaidAmount.toFixed(2)}

${expense.paidTime ? `【支付信息】
支付时间: ${expense.paidTime}
支付方式: ${expense.paymentMethod || '微信支付'}
` : ''}
${expense.dueDate && expense.status !== 'paid' ? `
【重要提醒】
请在 ${expense.dueDate} 前完成支付，避免产生滞期费用。
` : ''}
=========================================
                 感谢您的使用
=========================================
      `;

      const fs = Taro.getFileSystemManager();
      const filePath = `${Taro.env.USER_DATA_PATH}/bill_${expense.waybillNo}_${Date.now()}.txt`;
      fs.writeFileSync(filePath, billContent, 'utf8');

      try {
        const savedFile = await Taro.saveFile({ tempFilePath: filePath });
        Taro.hideLoading();

        Taro.showModal({
          title: '账单生成成功',
          content: `账单已保存到本地，是否立即查看？\n文件路径: ${savedFile.savedFilePath}`,
          confirmText: '立即查看',
          cancelText: '稍后查看',
          success: (res) => {
            if (res.confirm) {
              Taro.openDocument({
                filePath: savedFile.savedFilePath,
                showMenu: true,
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
                title: '账单已保存',
                icon: 'success'
              });
            }
          }
        });

        generateBillSummary(expense.waybillNo);
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
      console.error('Generate bill failed:', error);
      Taro.showToast({
        title: '生成账单失败',
        icon: 'none'
      });
    }
  };

  const handleDownloadInvoice = (expense: ExpenseInfo) => {
    Taro.showLoading({ title: '正在生成发票...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '发票已生成',
        icon: 'success'
      });
    }, 1000);
  };

  const handleViewWaybill = (waybillNo: string) => {
    Taro.switchTab({
      url: '/pages/waybill/index'
    });
    setTimeout(() => {
      Taro.eventCenter.trigger('searchWaybill', { waybillNo });
    }, 300);
  };

  const toggleCardExpand = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
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

  const handleViewBillCenter = () => {
    refreshBillSummaries();
    const bills = getBillSummaries();
    if (bills.length === 0) {
      Taro.showToast({
        title: '暂无对账单',
        icon: 'none'
      });
      return;
    }
    Taro.showActionSheet({
      itemList: bills.map(b => `运单${b.waybillNo} - ${b.statusText}`),
      success: (res) => {
        const bill = bills[res.tapIndex];
        Taro.navigateTo({
          url: `/pages/bill-detail/index?waybillNo=${bill.waybillNo}`
        });
      }
      });
  };

  const handleViewBillDetail = (waybillNo: string) => {
    const bill = generateBillSummary(waybillNo);
    if (bill) {
      Taro.navigateTo({
        url: `/pages/bill-detail/index?waybillNo=${waybillNo}`
      });
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.headerRow}>
          <View>
            <Text className={styles.pageTitle}>费用明细</Text>
            <Text className={styles.pageSubtitle}>查看和管理您的费用账单</Text>
          </View>
          <View className={styles.billCenterBtn} onClick={handleViewBillCenter}>
            <Text className={styles.billCenterIcon}>📊</Text>
            <Text className={styles.billCenterText}>对账单</Text>
          </View>
        </View>
      </View>

      <View className={styles.summaryCard}>
        <Text className={styles.summaryLabel}>待支付金额</Text>
        <Text className={styles.summaryAmount}>{formatAmount(statistics.totalUnpaid)}</Text>
        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemLabel}>已支付</Text>
            <Text className={styles.summaryItemValue}>{formatAmount(statistics.totalPaid)}</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemLabel}>总金额</Text>
            <Text className={styles.summaryItemValue}>{formatAmount(statistics.totalAmount)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterBar}>
        <View className={styles.searchInputWrapper}>
          <Input
            className={styles.searchInput}
            placeholder="输入运单号筛选"
            value={searchWaybillNo}
            onInput={(e) => setSearchWaybillNo(e.detail.value)}
            onConfirm={handleSearch}
          />
          <Button className={styles.searchBtn} onClick={handleSearch}>搜索</Button>
        </View>
        <View className={styles.filterActions}>
          <Button
            className={classNames(styles.filterBtn, { [styles.active]: showFilter })}
            onClick={() => setShowFilter(!showFilter)}
          >
            🔍 筛选
          </Button>
          {(selectedWaybill || searchWaybillNo) && (
            <Text className={styles.resetBtn} onClick={handleResetFilter}>重置</Text>
          )}
        </View>
      </View>

      {showFilter && (
        <View className={styles.filterPanel}>
          <View className={styles.filterItem}>
            <Text className={styles.filterLabel}>按运单筛选</Text>
            <Picker
              mode="selector"
              range={waybillOptions}
              value={waybillOptions.indexOf(selectedWaybill || '全部运单')}
              onChange={(e) => setSelectedWaybill(waybillOptions[e.detail.value])}
            >
              <Button className={styles.pickerBtn}>
                <Text className={styles.pickerText}>
                  {selectedWaybill || '请选择运单'}
                </Text>
                <Text className={styles.pickerIcon}>▼</Text>
              </Button>
            </Picker>
          </View>
        </View>
      )}

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
          {filteredExpenses.filter(e => e.status === 'unpaid' || e.status === 'partial').length > 0 && (
            <Text className={styles.tabBadge}>
              {filteredExpenses.filter(e => e.status === 'unpaid' || e.status === 'partial').length}
            </Text>
          )}
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
              <View
                className={styles.cardHeader}
                onClick={() => toggleCardExpand(expense.id)}
              >
                <View>
                  <Text
                    className={styles.waybillNo}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewWaybill(expense.waybillNo);
                    }}
                  >
                    运单号: {expense.waybillNo} →
                  </Text>
                  <Text className={styles.createTime}>账单日期: {expense.createTime}</Text>
                  {expense.paidTime && (
                    <Text className={styles.paidTime}>支付时间: {expense.paidTime}</Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <StatusBadge status={expense.status} text={expense.statusText} />
                  <Text className={styles.expandIcon}>
                    {expandedCardId === expense.id ? '▲' : '▼'}
                  </Text>
                </View>
              </View>

              <View className={styles.amountRow}>
                <Text className={styles.amountLabel}>账单金额</Text>
                <Text className={styles.amountValue}>{formatAmount(expense.totalAmount)}</Text>
              </View>

              {(expandedCardId === expense.id || expense.status !== 'paid') && (
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
              )}

              <View className={styles.paymentSummary}>
                <Text className={styles.paidAmount}>已支付: {formatAmount(expense.paidAmount)}</Text>
                <Text
                  className={classNames(styles.unpaidAmount, {
                    [styles.warning]: expense.unpaidAmount > 0
                  })}
                >
                  待支付: {formatAmount(expense.unpaidAmount)}
                </Text>
              </View>

              <View className={styles.cardFooter}>
                <View style={{ flex: 1 }}>
                  <Text
                    className={classNames(styles.dueInfo, {
                      [styles.dueWarning]: expense.status === 'unpaid' || expense.status === 'partial'
                    })}
                  >
                    {expense.status === 'paid'
                      ? '已全额支付'
                      : `截止日期: ${expense.dueDate}`}
                  </Text>
                </View>
                <View className={styles.actionGroup}>
                  <Button
                    className={classNames(styles.actionBtn, styles.secondary)}
                    onClick={() => handleViewBillDetail(expense.waybillNo)}
                  >
                    对账
                  </Button>
                  <Button
                    className={classNames(styles.actionBtn, styles.secondary)}
                    onClick={() => handleDownloadBill(expense)}
                  >
                    账单
                  </Button>
                  {expense.status === 'paid' && (
                    <Button
                      className={classNames(styles.actionBtn, styles.secondary)}
                      onClick={() => handleViewVoucher(expense)}
                    >
                      凭证
                    </Button>
                  )}
                  <Button
                    className={classNames(styles.actionBtn, styles.secondary)}
                    onClick={() => handleDownloadInvoice(expense)}
                  >
                    发票
                  </Button>
                  {(expense.status === 'unpaid' || expense.status === 'partial') && (
                    <Button
                      className={classNames(styles.actionBtn, styles.primary, {
                        [styles.disabled]: payingId === expense.id
                      })}
                      onClick={() => handlePay(expense)}
                      disabled={payingId === expense.id}
                    >
                      {payingId === expense.id ? '支付中...' : '去支付'}
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
            actionText={selectedWaybill || searchWaybillNo ? '重置筛选' : undefined}
            onAction={selectedWaybill || searchWaybillNo ? handleResetFilter : undefined}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default ExpensePage;
