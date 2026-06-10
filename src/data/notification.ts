import type { NotificationRecord } from '@/types';

export const mockNotifications: NotificationRecord[] = [
  {
    id: 'n_1',
    type: 'delay',
    typeText: '延误提醒',
    shipName: '中远之星',
    route: '上海港-重庆果园港',
    startPort: '上海港',
    endPort: '重庆果园港',
    title: '船舶延误提醒',
    content: '中远之星原定2024-06-10 08:00开航，因天气原因延误至2024-06-10 14:00',
    time: '2024-06-09 18:30:00',
    isRead: false,
    originalTime: '2024-06-10 08:00:00',
    estimatedTime: '2024-06-10 14:00:00'
  },
  {
    id: 'n_2',
    type: 'departure',
    typeText: '开航提醒',
    shipName: '东方之星',
    route: '南京港-武汉阳逻港',
    startPort: '南京港',
    endPort: '武汉阳逻港',
    title: '船舶即将开航',
    content: '东方之星将于2024-06-10 10:00从南京港起航，请做好提箱准备',
    time: '2024-06-09 16:00:00',
    isRead: false
  },
  {
    id: 'n_3',
    type: 'arrival',
    typeText: '到港提醒',
    shipName: '海顺号',
    route: '宁波港-广州黄埔港',
    startPort: '宁波港',
    endPort: '广州黄埔港',
    title: '船舶即将到港',
    content: '海顺号预计2024-06-10 16:00抵达广州黄埔港，请安排收货',
    time: '2024-06-09 12:00:00',
    isRead: true
  },
  {
    id: 'n_4',
    type: 'berth',
    typeText: '靠泊提醒',
    shipName: '中远之星',
    route: '上海港-重庆果园港',
    startPort: '上海港',
    endPort: '重庆果园港',
    title: '船舶已靠泊',
    content: '中远之星已于2024-06-09 20:00靠泊上海港，开始装货作业',
    time: '2024-06-09 20:05:00',
    isRead: true
  },
  {
    id: 'n_5',
    type: 'delay',
    typeText: '延误提醒',
    shipName: '海顺号',
    route: '宁波港-广州黄埔港',
    startPort: '宁波港',
    endPort: '广州黄埔港',
    title: '船舶延误提醒',
    content: '海顺号原定2024-06-11 09:00到港，预计延误至2024-06-11 15:00',
    time: '2024-06-10 08:00:00',
    isRead: false,
    originalTime: '2024-06-11 09:00:00',
    estimatedTime: '2024-06-11 15:00:00'
  },
  {
    id: 'n_6',
    type: 'departure',
    typeText: '开航提醒',
    shipName: '东方之星',
    route: '武汉阳逻港-重庆果园港',
    startPort: '武汉阳逻港',
    endPort: '重庆果园港',
    title: '船舶即将开航',
    content: '东方之星将于2024-06-12 08:00从武汉阳逻港起航',
    time: '2024-06-11 16:00:00',
    isRead: false
  }
];
