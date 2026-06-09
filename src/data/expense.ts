import type { ExpenseInfo } from '@/types';

export const mockExpenses: ExpenseInfo[] = [
  {
    id: 'e1',
    waybillNo: 'SY202406100001',
    totalAmount: 12580.00,
    paidAmount: 0,
    unpaidAmount: 12580.00,
    status: 'unpaid',
    statusText: '待支付',
    items: [
      { id: 'i1', name: '基本运费', amount: 8500.00, type: 'freight', remark: '上海-重庆 20GP' },
      { id: 'i2', name: '港杂费', amount: 1880.00, type: 'port', remark: '上海港装港费' },
      { id: 'i3', name: '港杂费', amount: 1600.00, type: 'port', remark: '重庆港卸港费' },
      { id: 'i4', name: '文件费', amount: 600.00, type: 'other', remark: '电子提单费' }
    ],
    createTime: '2024-06-10 08:00',
    dueDate: '2024-06-20 23:59'
  },
  {
    id: 'e2',
    waybillNo: 'SY202406080002',
    totalAmount: 9650.00,
    paidAmount: 9650.00,
    unpaidAmount: 0,
    status: 'paid',
    statusText: '已支付',
    items: [
      { id: 'i1', name: '基本运费', amount: 6200.00, type: 'freight', remark: '南京-武汉 40HQ' },
      { id: 'i2', name: '港杂费', amount: 1450.00, type: 'port', remark: '南京港装港费' },
      { id: 'i3', name: '港杂费', amount: 1200.00, type: 'port', remark: '武汉港卸港费' },
      { id: 'i4', name: '滞箱费', amount: 800.00, type: 'detention', remark: '超期2天' }
    ],
    createTime: '2024-06-08 08:30',
    dueDate: '2024-06-18 23:59'
  },
  {
    id: 'e3',
    waybillNo: 'SY202406050003',
    totalAmount: 15200.00,
    paidAmount: 7600.00,
    unpaidAmount: 7600.00,
    status: 'partial',
    statusText: '部分支付',
    items: [
      { id: 'i1', name: '基本运费', amount: 10500.00, type: 'freight', remark: '宁波-广州 20GP' },
      { id: 'i2', name: '港杂费', amount: 2200.00, type: 'port', remark: '宁波港装港费' },
      { id: 'i3', name: '港杂费', amount: 1800.00, type: 'port', remark: '广州港卸港费' },
      { id: 'i4', name: '滞箱费', amount: 700.00, type: 'detention', remark: '查验滞留' }
    ],
    createTime: '2024-06-05 09:30',
    dueDate: '2024-06-15 23:59'
  }
];

export const expenseTypeMap: Record<string, { label: string; color: string }> = {
  freight: { label: '运费', color: '#0077C8' },
  port: { label: '港杂费', color: '#FF7D00' },
  detention: { label: '滞箱费', color: '#F53F3F' },
  other: { label: '其他', color: '#86909C' }
};
