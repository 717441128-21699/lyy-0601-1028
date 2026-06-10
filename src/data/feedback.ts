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
    statusText: '已处理',
    createTime: '2024-06-11 15:30',
    reply: '已核实，确认为码头装卸过程中造成的轻微破损，已安排保险公司定损，后续将有专人与您联系理赔事宜。',
    replyTime: '2024-06-11 18:45',
    history: [
      {
        id: 'h1',
        feedbackId: 'f1',
        action: 'submit',
        actionText: '提交反馈',
        operator: '货主',
        time: '2024-06-11 15:30',
        content: '提箱时发现箱体有轻微凹陷，内部货物外包装有破损痕迹，请核实处理。',
        photos: ['https://picsum.photos/id/292/400/400', 'https://picsum.photos/id/312/400/400']
      },
      {
        id: 'h2',
        feedbackId: 'f1',
        action: 'process',
        actionText: '开始处理',
        operator: '客服',
        time: '2024-06-11 16:00',
        content: '已收到您的反馈，正在安排现场人员核实情况。'
      },
      {
        id: 'h3',
        feedbackId: 'f1',
        action: 'resolve',
        actionText: '处理完成',
        operator: '客服',
        time: '2024-06-11 18:45',
        content: '已核实，确认为码头装卸过程中造成的轻微破损，已安排保险公司定损，后续将有专人与您联系理赔事宜。'
      }
    ]
  },
  {
    id: 'f2',
    type: 'missing',
    typeText: '少箱',
    waybillNo: 'SY202406050003',
    description: '报关单显示3个集装箱，但实际到港只有2个，请协助查找缺失的集装箱。',
    photos: [],
    status: 'need_more',
    statusText: '需补充材料',
    createTime: '2024-06-09 09:15',
    reply: '正在核实装船记录和码头堆场信息，请提供装箱单照片以便进一步核对。',
    replyTime: '2024-06-09 11:30',
    history: [
      {
        id: 'h4',
        feedbackId: 'f2',
        action: 'submit',
        actionText: '提交反馈',
        operator: '货主',
        time: '2024-06-09 09:15',
        content: '报关单显示3个集装箱，但实际到港只有2个，请协助查找缺失的集装箱。',
        photos: []
      },
      {
        id: 'h5',
        feedbackId: 'f2',
        action: 'process',
        actionText: '开始处理',
        operator: '客服',
        time: '2024-06-09 10:00',
        content: '已收到您的反馈，正在核实相关记录。'
      },
      {
        id: 'h6',
        feedbackId: 'f2',
        action: 'request_more',
        actionText: '要求补充材料',
        operator: '客服',
        time: '2024-06-09 11:30',
        content: '正在核实装船记录和码头堆场信息，请提供装箱单照片以便进一步核对。'
      }
    ]
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
    status: 'processing',
    statusText: '处理中',
    createTime: '2024-06-12 10:00',
    reply: '已收到您的反馈，正在核对提单信息，预计1小时内完成修改。',
    replyTime: '2024-06-12 10:30',
    history: [
      {
        id: 'h7',
        feedbackId: 'f3',
        action: 'submit',
        actionText: '提交反馈',
        operator: '货主',
        time: '2024-06-12 10:00',
        content: '电子提单信息有误，收货方名称拼写错误，请尽快修改。',
        photos: ['https://picsum.photos/id/225/400/400']
      },
      {
        id: 'h8',
        feedbackId: 'f3',
        action: 'process',
        actionText: '开始处理',
        operator: '客服',
        time: '2024-06-12 10:30',
        content: '已收到您的反馈，正在核对提单信息，预计1小时内完成修改。'
      }
    ]
  },
  {
    id: 'f4',
    type: 'other',
    typeText: '其他问题',
    waybillNo: 'SY202406080001',
    description: '码头提箱效率太低，等待了3小时才提到箱子，希望能优化提箱流程。',
    photos: [],
    status: 'pending',
    statusText: '待处理',
    createTime: '2024-06-12 14:00',
    history: [
      {
        id: 'h9',
        feedbackId: 'f4',
        action: 'submit',
        actionText: '提交反馈',
        operator: '货主',
        time: '2024-06-12 14:00',
        content: '码头提箱效率太低，等待了3小时才提到箱子，希望能优化提箱流程。',
        photos: []
      }
    ]
  }
];

export const feedbackTypeOptions = [
  { value: 'damage', label: '货损' },
  { value: 'missing', label: '少箱' },
  { value: 'document', label: '单证问题' },
  { value: 'other', label: '其他问题' }
];

export const feedbackStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: '#FF7D00' },
  processing: { label: '处理中', color: '#0077C8' },
  need_more: { label: '需补充材料', color: '#F53F3F' },
  resolved: { label: '已处理', color: '#00B42A' }
};
