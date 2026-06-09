import type { FeedbackRecord } from '@/types';

export const mockFeedbacks: FeedbackRecord[] = [
  {
    id: 'f1',
    type: 'damage',
    typeText: '货损',
    waybillNo: 'SY202406080002',
    description: '提箱时发现箱体有轻微凹陷，内部货物外包装有破损痕迹，请核实处理。',
    photos: [
      'https://picsum.photos/id/292/400/400',
      'https://picsum.photos/id/312/400/400'
    ],
    status: 'resolved',
    statusText: '已解决',
    createTime: '2024-06-11 15:30',
    reply: '已核实，确认为码头装卸过程中造成的轻微破损，已安排保险公司定损，后续将有专人与您联系理赔事宜。',
    replyTime: '2024-06-11 18:45'
  },
  {
    id: 'f2',
    type: 'missing',
    typeText: '少箱',
    waybillNo: 'SY202406050003',
    description: '报关单显示3个集装箱，但实际到港只有2个，请协助查找缺失的集装箱。',
    photos: [],
    status: 'processing',
    statusText: '处理中',
    createTime: '2024-06-09 09:15',
    reply: '正在核实装船记录和码头堆场信息，预计24小时内给出答复。',
    replyTime: '2024-06-09 11:30'
  },
  {
    id: 'f3',
    type: 'document',
    typeText: '单证问题',
    waybillNo: 'SY202406100001',
    description: '电子提单信息有误，收货方名称拼写错误，请尽快修改。',
    photos: [
      'https://picsum.photos/id/225/400/400'
    ],
    status: 'pending',
    statusText: '待处理',
    createTime: '2024-06-12 10:00'
  }
];

export const feedbackTypeOptions = [
  { value: 'damage', label: '货损' },
  { value: 'missing', label: '少箱' },
  { value: 'document', label: '单证问题' },
  { value: 'other', label: '其他问题' }
];
