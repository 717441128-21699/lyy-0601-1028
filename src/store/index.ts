import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import type {
  WaybillInfo,
  Subscription,
  FeedbackRecord,
  FeedbackHistory,
  ExpenseInfo,
  EReceipt,
  PaymentRecord,
  ShipTracking,
  NotificationRecord,
  BillSummary,
  FeedbackStatus
} from '@/types';
import { mockWaybills } from '@/data/waybill';
import { mockSubscriptions } from '@/data/subscription';
import { mockFeedbacks } from '@/data/feedback';
import { mockExpenses } from '@/data/expense';
import { mockTrackings } from '@/data/tracking';
import { mockNotifications } from '@/data/notification';

interface AppState {
  waybills: WaybillInfo[];
  subscriptions: Subscription[];
  feedbacks: FeedbackRecord[];
  expenses: ExpenseInfo[];
  trackings: ShipTracking[];
  searchHistory: string[];
  eReceipts: EReceipt[];
  paymentRecords: PaymentRecord[];
  notifications: NotificationRecord[];
  billSummaries: BillSummary[];
  currentWaybill: WaybillInfo | null;
  currentTracking: ShipTracking | null;

  setCurrentWaybill: (waybill: WaybillInfo | null) => void;
  setCurrentTracking: (tracking: ShipTracking | null) => void;
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;
  getWaybillByNo: (waybillNo: string) => WaybillInfo | undefined;
  addFeedback: (feedback: Omit<FeedbackRecord, 'id' | 'createTime' | 'status' | 'statusText' | 'history'>) => void;
  updateFeedback: (id: string, updates: Partial<FeedbackRecord>) => void;
  addFeedbackHistory: (feedbackId: string, history: Omit<FeedbackHistory, 'id' | 'feedbackId'>) => void;
  replyFeedback: (feedbackId: string, content: string, photos?: string[]) => void;
  updateFeedbackStatus: (feedbackId: string, status: FeedbackStatus, statusText: string, remark?: string) => void;
  getFeedbackById: (id: string) => FeedbackRecord | undefined;
  toggleSubscription: (id: string) => void;
  getSubscribedSubscriptions: () => Subscription[];
  updateExpensePayment: (id: string, amount: number, paymentMethod: string, voucherUrl: string) => void;
  getExpensesByWaybillNo: (waybillNo: string) => ExpenseInfo[];
  generateEReceipt: (waybill: WaybillInfo) => EReceipt;
  getEReceiptByWaybillNo: (waybillNo: string) => EReceipt | undefined;
  updateEReceiptFile: (id: string, filePath: string, fileType: 'pdf' | 'image') => void;
  getTrackingByShipName: (shipName: string) => ShipTracking | undefined;
  getTrackingByWaybillNo: (waybillNo: string) => ShipTracking | undefined;
  getWaybillsByShipName: (shipName: string) => WaybillInfo[];
  getNotifications: (filters?: { shipName?: string; route?: string; type?: string }) => NotificationRecord[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadNotificationCount: () => number;
  getBillSummaries: (filters?: { waybillNo?: string; status?: string }) => BillSummary[];
  getBillSummaryByWaybillNo: (waybillNo: string) => BillSummary | undefined;
  generateBillSummary: (waybillNo: string) => BillSummary | null;
  updateBillFile: (billId: string, fileUrl: string) => void;
  resetAll: () => void;
}

const getInitialState = () => ({
  waybills: mockWaybills,
  subscriptions: mockSubscriptions,
  feedbacks: mockFeedbacks,
  expenses: mockExpenses,
  trackings: mockTrackings,
  searchHistory: [],
  eReceipts: [],
  paymentRecords: [],
  notifications: mockNotifications,
  billSummaries: [],
  currentWaybill: null,
  currentTracking: null
});

const feedbackStatusMap: Record<FeedbackStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  need_more: '需补充材料',
  resolved: '已处理'
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setCurrentWaybill: (waybill) => set({ currentWaybill: waybill }),
      setCurrentTracking: (tracking) => set({ currentTracking: tracking }),

      addSearchHistory: (keyword) => {
        const { searchHistory } = get();
        const filtered = searchHistory.filter(k => k !== keyword);
        const newHistory = [keyword, ...filtered].slice(0, 10);
        set({ searchHistory: newHistory });
      },

      clearSearchHistory: () => set({ searchHistory: [] }),

      getWaybillByNo: (waybillNo) => {
        return get().waybills.find(w => w.waybillNo === waybillNo);
      },

      addFeedback: (feedback) => {
        const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
        const history: FeedbackHistory = {
          id: `h_${Date.now()}`,
          feedbackId: '',
          action: 'submit',
          actionText: '提交反馈',
          operator: '货主',
          time: now,
          content: feedback.description,
          photos: feedback.photos
        };

        const newFeedback: FeedbackRecord = {
          ...feedback,
          id: `f_${Date.now()}`,
          createTime: now,
          status: 'pending',
          statusText: '待处理',
          history: [{ ...history, feedbackId: `f_${Date.now()}` }]
        };
        set(state => ({
          feedbacks: [newFeedback, ...state.feedbacks]
        }));
      },

      updateFeedback: (id, updates) => {
        set(state => ({
          feedbacks: state.feedbacks.map(f =>
            f.id === id ? { ...f, ...updates } : f
          )
        }));
      },

      addFeedbackHistory: (feedbackId, history) => {
        const newHistory: FeedbackHistory = {
          ...history,
          id: `h_${Date.now()}`,
          feedbackId
        };
        set(state => ({
          feedbacks: state.feedbacks.map(f =>
            f.id === feedbackId
              ? { ...f, history: [...f.history, newHistory] }
              : f
          )
        }));
      },

      replyFeedback: (feedbackId, content, photos) => {
        const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
        const newHistory: FeedbackHistory = {
          id: `h_${Date.now()}`,
          feedbackId,
          action: 'reply',
          actionText: '补充材料',
          operator: '货主',
          time: now,
          content,
          photos
        };
        set(state => ({
          feedbacks: state.feedbacks.map(f =>
            f.id === feedbackId
              ? {
                  ...f,
                  status: 'processing',
                  statusText: '处理中',
                  history: [...f.history, newHistory]
                }
              : f
          )
        }));
      },

      updateFeedbackStatus: (feedbackId, status, statusText, remark) => {
        const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
        const actionMap: Record<string, FeedbackHistory['action']> = {
          processing: 'process',
          need_more: 'request_more',
          resolved: 'resolve'
        };
        const actionTextMap: Record<string, string> = {
          processing: '开始处理',
          need_more: '要求补充材料',
          resolved: '处理完成'
        };

        const newHistory: FeedbackHistory = {
          id: `h_${Date.now()}`,
          feedbackId,
          action: actionMap[status] || 'process',
          actionText: actionTextMap[status] || statusText,
          operator: '客服',
          time: now,
          content: remark || statusText
        };

        set(state => ({
          feedbacks: state.feedbacks.map(f =>
            f.id === feedbackId
              ? {
                  ...f,
                  status,
                  statusText: feedbackStatusMap[status] || statusText,
                  reply: remark,
                  replyTime: now,
                  history: [...f.history, newHistory]
                }
              : f
          )
        }));
      },

      getFeedbackById: (id) => {
        return get().feedbacks.find(f => f.id === id);
      },

      toggleSubscription: (id) => {
        set(state => ({
          subscriptions: state.subscriptions.map(s =>
            s.id === id ? { ...s, isSubscribed: !s.isSubscribed } : s
          )
        }));
      },

      getSubscribedSubscriptions: () => {
        return get().subscriptions.filter(s => s.isSubscribed);
      },

      updateExpensePayment: (id, amount, paymentMethod, voucherUrl) => {
        set(state => {
          const expense = state.expenses.find(e => e.id === id);
          if (!expense) return state;

          const newPaidAmount = expense.paidAmount + amount;
          const newUnpaidAmount = expense.unpaidAmount - amount;
          let newStatus: 'paid' | 'partial' | 'unpaid';
          let newStatusText: string;

          if (newUnpaidAmount <= 0) {
            newStatus = 'paid';
            newStatusText = '已支付';
          } else if (newPaidAmount > 0) {
            newStatus = 'partial';
            newStatusText = '部分支付';
          } else {
            newStatus = 'unpaid';
            newStatusText = '待支付';
          }

          const paymentRecord: PaymentRecord = {
            id: `p_${Date.now()}`,
            expenseId: id,
            waybillNo: expense.waybillNo,
            amount,
            paymentMethod,
            paymentTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
            voucherUrl
          };

          return {
            expenses: state.expenses.map(e =>
              e.id === id
                ? {
                    ...e,
                    paidAmount: newPaidAmount,
                    unpaidAmount: newUnpaidAmount,
                    status: newStatus,
                    statusText: newStatusText,
                    paidTime: newStatus === 'paid' ? paymentRecord.paymentTime : e.paidTime,
                    paymentVoucher: voucherUrl
                  }
                : e
            ),
            paymentRecords: [paymentRecord, ...state.paymentRecords]
          };
        });
      },

      getExpensesByWaybillNo: (waybillNo) => {
        return get().expenses.filter(e => e.waybillNo === waybillNo);
      },

      generateEReceipt: (waybill) => {
        const existing = get().eReceipts.find(r => r.waybillNo === waybill.waybillNo);
        if (existing) return existing;

        const receipt: EReceipt = {
          id: `r_${Date.now()}`,
          waybillNo: waybill.waybillNo,
          containerNo: waybill.containerNo,
          shipName: waybill.shipName,
          route: waybill.route,
          startPort: waybill.startPort,
          endPort: waybill.endPort,
          cargoName: waybill.cargoName,
          sender: waybill.sender,
          receiver: waybill.receiver,
          nodes: waybill.nodes,
          generateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        };

        set(state => ({
          eReceipts: [receipt, ...state.eReceipts]
        }));

        return receipt;
      },

      getEReceiptByWaybillNo: (waybillNo) => {
        return get().eReceipts.find(r => r.waybillNo === waybillNo);
      },

      updateEReceiptFile: (id, filePath, fileType) => {
        set(state => ({
          eReceipts: state.eReceipts.map(r =>
            r.id === id ? { ...r, filePath, fileType } : r
          )
        }));
      },

      getTrackingByShipName: (shipName) => {
        return get().trackings.find(t => t.shipName === shipName);
      },

      getTrackingByWaybillNo: (waybillNo) => {
        return get().trackings.find(t => t.waybillNos.includes(waybillNo));
      },

      getWaybillsByShipName: (shipName) => {
        return get().waybills.filter(w => w.shipName === shipName);
      },

      getNotifications: (filters) => {
        let data = [...get().notifications];
        if (filters?.shipName) {
          data = data.filter(n => n.shipName === filters.shipName);
        }
        if (filters?.route) {
          data = data.filter(n => n.route === filters.route);
        }
        if (filters?.type) {
          data = data.filter(n => n.type === filters.type);
        }
        return data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      },

      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
          )
        }));
      },

      markAllNotificationsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true }))
        }));
      },

      getUnreadNotificationCount: () => {
        return get().notifications.filter(n => !n.isRead).length;
      },

      getBillSummaries: (filters) => {
        let data = [...get().billSummaries];
        if (filters?.waybillNo) {
          data = data.filter(b => b.waybillNo === filters.waybillNo);
        }
        if (filters?.status) {
          data = data.filter(b => b.status === filters.status);
        }
        return data.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
      },

      getBillSummaryByWaybillNo: (waybillNo) => {
        return get().billSummaries.find(b => b.waybillNo === waybillNo);
      },

      generateBillSummary: (waybillNo) => {
        const existing = get().billSummaries.find(b => b.waybillNo === waybillNo);
        if (existing) return existing;

        const waybill = get().getWaybillByNo(waybillNo);
        if (!waybill) return null;

        const expenses = get().getExpensesByWaybillNo(waybillNo);
        const payments = get().paymentRecords.filter(p => p.waybillNo === waybillNo);

        if (expenses.length === 0) return null;

        const totalAmount = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
        const paidAmount = expenses.reduce((sum, e) => sum + e.paidAmount, 0);
        const unpaidAmount = expenses.reduce((sum, e) => sum + e.unpaidAmount, 0);
        const hasUnpaid = expenses.some(e => e.status === 'unpaid' || e.status === 'partial');
        const allPaid = expenses.every(e => e.status === 'paid');

        let status: 'paid' | 'partial' | 'unpaid';
        let statusText: string;
        if (allPaid) {
          status = 'paid';
          statusText = '已结清';
        } else if (paidAmount > 0) {
          status = 'partial';
          statusText = '部分支付';
        } else {
          status = 'unpaid';
          statusText = '待支付';
        }

        const earliestDueDate = expenses.reduce((earliest, e) =>
          new Date(e.dueDate) < new Date(earliest) ? e.dueDate : earliest
        , expenses[0].dueDate);

        const bill: BillSummary = {
          id: `b_${Date.now()}`,
          waybillNo,
          shipName: waybill.shipName,
          route: waybill.route,
          startPort: waybill.startPort,
          endPort: waybill.endPort,
          totalAmount,
          paidAmount,
          unpaidAmount,
          status,
          statusText,
          createTime: expenses[0].createTime,
          dueDate: earliestDueDate,
          expenseIds: expenses.map(e => e.id),
          paymentRecords: payments
        };

        set(state => ({
          billSummaries: [bill, ...state.billSummaries]
        }));

        return bill;
      },

      updateBillFile: (billId, fileUrl) => {
        set(state => ({
          billSummaries: state.billSummaries.map(b =>
            b.id === billId
              ? { ...b, billFileUrl: fileUrl, generateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }
              : b
          )
        }));
      },

      resetAll: () => set(getInitialState())
    }),
    {
      name: 'water-transport-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            return Taro.getStorageSync(name);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            Taro.setStorageSync(name, value);
          } catch {
            console.error('Failed to save to storage');
          }
        },
        removeItem: (name) => {
          try {
            Taro.removeStorageSync(name);
          } catch {
            console.error('Failed to remove from storage');
          }
        }
      })),
      partialize: (state) => ({
        subscriptions: state.subscriptions,
        feedbacks: state.feedbacks,
        expenses: state.expenses,
        searchHistory: state.searchHistory,
        eReceipts: state.eReceipts,
        paymentRecords: state.paymentRecords,
        notifications: state.notifications,
        billSummaries: state.billSummaries
      })
    }
  )
);
