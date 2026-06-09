import type { Subscription } from '@/types';

export const mockSubscriptions: Subscription[] = [
  {
    id: 's1',
    route: '上海-重庆',
    shipName: '中远之星',
    startPort: '上海港',
    endPort: '重庆果园港',
    estimatedDeparture: '2024-06-11 22:00',
    estimatedArrival: '2024-06-13 22:00',
    status: 'normal',
    statusText: '正常',
    notifyTypes: ['开航提醒', '靠泊提醒', '延误提醒'],
    isSubscribed: true
  },
  {
    id: 's2',
    route: '南京-武汉',
    shipName: '长江明珠',
    startPort: '南京港',
    endPort: '武汉阳逻港',
    estimatedDeparture: '2024-06-09 18:00',
    estimatedArrival: '2024-06-11 06:00',
    status: 'delayed',
    statusText: '延误2小时',
    notifyTypes: ['开航提醒', '靠泊提醒'],
    isSubscribed: true
  },
  {
    id: 's3',
    route: '宁波-广州',
    shipName: '海运先锋',
    startPort: '宁波港',
    endPort: '广州黄埔港',
    estimatedDeparture: '2024-06-07 08:00',
    estimatedArrival: '2024-06-09 12:00',
    status: 'cancelled',
    statusText: '已取消',
    notifyTypes: ['延误提醒'],
    isSubscribed: false
  },
  {
    id: 's4',
    route: '上海-武汉',
    shipName: '东方之星',
    startPort: '上海港',
    endPort: '武汉阳逻港',
    estimatedDeparture: '2024-06-14 10:00',
    estimatedArrival: '2024-06-16 18:00',
    status: 'normal',
    statusText: '正常',
    notifyTypes: ['开航提醒', '靠泊提醒', '延误提醒'],
    isSubscribed: false
  },
  {
    id: 's5',
    route: '重庆-上海',
    shipName: '盛世之星',
    startPort: '重庆果园港',
    endPort: '上海港',
    estimatedDeparture: '2024-06-15 16:00',
    estimatedArrival: '2024-06-18 08:00',
    status: 'normal',
    statusText: '正常',
    notifyTypes: ['开航提醒', '靠泊提醒'],
    isSubscribed: false
  }
];

export const mockRoutes = [
  '上海-重庆',
  '上海-武汉',
  '南京-武汉',
  '宁波-广州',
  '重庆-上海',
  '武汉-南京',
  '广州-宁波',
  '重庆-武汉'
];

export const mockShipNames = [
  '中远之星',
  '长江明珠',
  '海运先锋',
  '东方之星',
  '盛世之星',
  '和谐号',
  '长江一号',
  '黄浦号'
];
