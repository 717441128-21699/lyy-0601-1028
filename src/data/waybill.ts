import type { WaybillInfo } from '@/types';

export const mockWaybills: WaybillInfo[] = [
  {
    id: '1',
    waybillNo: 'SY202406100001',
    containerNo: 'MSKU1234567',
    shipName: '中远之星',
    route: '上海-重庆',
    startPort: '上海港',
    endPort: '重庆果园港',
    status: 'transit',
    statusText: '运输中',
    currentNode: 3,
    nodes: [
      { id: 'n1', name: '装箱', status: 'completed', time: '2024-06-10 08:30', location: '上海洋山堆场', operator: '张师傅', remark: '20GP标准集装箱' },
      { id: 'n2', name: '进港', status: 'completed', time: '2024-06-10 14:20', location: '上海港外高桥二期', operator: '王调度', remark: '海关放行' },
      { id: 'n3', name: '装船', status: 'completed', time: '2024-06-11 09:15', location: '上海港码头3号泊位', operator: '李工', remark: '船舱位置: 3层12区' },
      { id: 'n4', name: '离港', status: 'current', time: '2024-06-11 22:00', location: '长江口水域', operator: '刘船长', remark: '预计航行48小时' },
      { id: 'n5', name: '到港', status: 'pending', location: '重庆果园港' },
      { id: 'n6', name: '提箱', status: 'pending', location: '重庆堆场' }
    ],
    cargoName: '电子产品',
    cargoWeight: '25.5吨',
    cargoVolume: '68立方米',
    sender: '上海电子科技有限公司',
    receiver: '重庆智慧产业园',
    createTime: '2024-06-10 08:00',
    estimatedArrivalTime: '2024-06-13 22:00'
  },
  {
    id: '2',
    waybillNo: 'SY202406080002',
    containerNo: 'MSKU7654321',
    shipName: '长江明珠',
    route: '南京-武汉',
    startPort: '南京港',
    endPort: '武汉阳逻港',
    status: 'completed',
    statusText: '已完成',
    currentNode: 6,
    nodes: [
      { id: 'n1', name: '装箱', status: 'completed', time: '2024-06-08 09:00', location: '南京龙潭堆场', operator: '赵师傅', remark: '40HQ高箱' },
      { id: 'n2', name: '进港', status: 'completed', time: '2024-06-08 15:30', location: '南京港龙潭港区', operator: '钱调度', remark: '检验检疫通过' },
      { id: 'n3', name: '装船', status: 'completed', time: '2024-06-09 07:45', location: '南京港码头5号泊位', operator: '孙工', remark: '船舱位置: 2层8区' },
      { id: 'n4', name: '离港', status: 'completed', time: '2024-06-09 18:00', location: '南京长江水域', operator: '周船长', remark: '航行时间36小时' },
      { id: 'n5', name: '到港', status: 'completed', time: '2024-06-11 06:00', location: '武汉阳逻港', operator: '吴调度', remark: '安全靠泊' },
      { id: 'n6', name: '提箱', status: 'completed', time: '2024-06-11 14:30', location: '武汉阳逻堆场', operator: '郑师傅', remark: '收货人已签收' }
    ],
    cargoName: '机械设备',
    cargoWeight: '18.2吨',
    cargoVolume: '75立方米',
    sender: '南京重型机械有限公司',
    receiver: '武汉制造基地',
    createTime: '2024-06-08 08:30',
    estimatedArrivalTime: '2024-06-11 06:00'
  },
  {
    id: '3',
    waybillNo: 'SY202406050003',
    containerNo: 'MSKU9876543',
    shipName: '海运先锋',
    route: '宁波-广州',
    startPort: '宁波港',
    endPort: '广州黄埔港',
    status: 'exception',
    statusText: '异常',
    currentNode: 2,
    nodes: [
      { id: 'n1', name: '装箱', status: 'completed', time: '2024-06-05 10:00', location: '宁波北仑堆场', operator: '陈师傅', remark: '20GP标准集装箱' },
      { id: 'n2', name: '进港', status: 'current', time: '2024-06-06 11:20', location: '宁波港北仑港区', operator: '褚调度', remark: '海关查验中' },
      { id: 'n3', name: '装船', status: 'pending', location: '宁波港码头' },
      { id: 'n4', name: '离港', status: 'pending' },
      { id: 'n5', name: '到港', status: 'pending', location: '广州黄埔港' },
      { id: 'n6', name: '提箱', status: 'pending', location: '广州堆场' }
    ],
    cargoName: '化工原料',
    cargoWeight: '28.0吨',
    cargoVolume: '55立方米',
    sender: '宁波化工有限公司',
    receiver: '广州精细化工产业园',
    createTime: '2024-06-05 09:30',
    estimatedArrivalTime: '2024-06-09 12:00'
  },
  {
    id: '4',
    waybillNo: 'SY202406120004',
    containerNo: 'MSKU4567890',
    shipName: '东方之星',
    route: '上海-武汉',
    startPort: '上海港',
    endPort: '武汉阳逻港',
    status: 'pending',
    statusText: '待运输',
    currentNode: 0,
    nodes: [
      { id: 'n1', name: '装箱', status: 'pending', location: '上海堆场' },
      { id: 'n2', name: '进港', status: 'pending' },
      { id: 'n3', name: '装船', status: 'pending' },
      { id: 'n4', name: '离港', status: 'pending' },
      { id: 'n5', name: '到港', status: 'pending', location: '武汉阳逻港' },
      { id: 'n6', name: '提箱', status: 'pending', location: '武汉堆场' }
    ],
    cargoName: '纺织原料',
    cargoWeight: '15.8吨',
    cargoVolume: '62立方米',
    sender: '上海纺织集团',
    receiver: '武汉纺织产业园',
    createTime: '2024-06-12 08:00',
    estimatedArrivalTime: '2024-06-16 18:00'
  }
];

export const getWaybillByNo = (waybillNo: string): WaybillInfo | undefined => {
  return mockWaybills.find(w => w.waybillNo === waybillNo);
};
