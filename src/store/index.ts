import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import type {
  WaybillInfo,
  Subscription,
  FeedbackRecord,
  ExpenseInfo,
  EReceipt,
  PaymentRecord,
  ShipTracking
} from '@/types';
import { mockWaybills } from '@/data/waybill';
import { mockSubscriptions } from '@/data/subscription';
import { mockFeedbacks } from '@/data/feedback';
import { mockExpenses } from '@/data/expense';
import { mockTrackings } from '@/data/tracking';

interface AppState {
  waybills: WaybillInfo[];
  subscriptions: Subscription[];
  feedbacks: FeedbackRecord[];
  expenses: ExpenseInfo[];
  trackings: ShipTracking[];
  searchHistory: string[];
  eReceipts: EReceipt[];
  paymentRecords: PaymentRecord[];
  currentWaybill: WaybillInfo | null;
  currentTracking: ShipTracking | null;

  setCurrentWaybill: (waybill: WaybillInfo | null) => void;
  setCurrentTracking: (tracking: ShipTracking | null) => void;
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;
  getWaybillByNo: (waybillNo: string) => WaybillInfo | undefined;
  addFeedback: (feedback: Omit<FeedbackRecord, 'id' | 'createTime' | 'status' | 'statusText'>) => void;
  updateFeedback: (id: string, updates: Partial<FeedbackRecord>) => void;
  toggleSubscription: (id: string) => void;
  getSubscribedSubscriptions: () => Subscription[];
  updateExpensePayment: (id: string, amount: number, paymentMethod: string, voucherUrl: string) => void;
  getExpensesByWaybillNo: (waybillNo: string) => ExpenseInfo[];
  generateEReceipt: (waybill: WaybillInfo) => EReceipt;
  getEReceiptByWaybillNo: (waybillNo: string) => EReceipt | undefined;
  getTrackingByShipName: (shipName: string) => ShipTracking | undefined;
  getTrackingByWaybillNo: (waybillNo: string) => ShipTracking | undefined;
  getWaybillsByShipName: (shipName: string) => WaybillInfo[];
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
  currentWaybill: null,
  currentTracking: null
});

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
        const newFeedback: FeedbackRecord = {
          ...feedback,
          id: `f_${Date.now()}`,
          createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          status: 'pending',
          statusText: '待处理'
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

      getTrackingByShipName: (shipName) => {
        return get().trackings.find(t => t.shipName === shipName);
      },

      getTrackingByWaybillNo: (waybillNo) => {
        return get().trackings.find(t => t.waybillNos.includes(waybillNo));
      },

      getWaybillsByShipName: (shipName) => {
        return get().waybills.filter(w => w.shipName === shipName);
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
        paymentRecords: state.paymentRecords
      })
    }
  )
);
