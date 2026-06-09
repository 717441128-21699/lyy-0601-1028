import type { ShipTracking } from '@/types';

export const mockTracking: ShipTracking[] = [
  {
    id: 't1',
    shipName: '中远之星',
    mmsi: '413300000',
    currentLatitude: 31.2304,
    currentLongitude: 121.4737,
    currentSpeed: '12.5节',
    currentCourse: '285°',
    status: 'sailing',
    statusText: '航行中',
    startPort: '上海港',
    endPort: '重庆果园港',
    estimatedArrivalTime: '2024-06-13 22:00',
    distanceRemaining: '1,280公里',
    trackPoints: [
      { latitude: 31.2304, longitude: 121.4737, time: '2024-06-11 22:00' },
      { latitude: 31.5000, longitude: 121.0000, time: '2024-06-12 02:00' },
      { latitude: 31.8000, longitude: 120.5000, time: '2024-06-12 06:00' },
      { latitude: 32.0000, longitude: 119.8000, time: '2024-06-12 10:00' },
      { latitude: 32.2000, longitude: 119.0000, time: '2024-06-12 14:00' }
    ],
    waybillNos: ['SY202406100001', 'SY202406100002']
  },
  {
    id: 't2',
    shipName: '长江明珠',
    mmsi: '413300001',
    currentLatitude: 30.5928,
    currentLongitude: 114.3055,
    currentSpeed: '0节',
    currentCourse: '0°',
    status: 'moored',
    statusText: '已靠泊',
    startPort: '南京港',
    endPort: '武汉阳逻港',
    estimatedArrivalTime: '2024-06-11 06:00',
    distanceRemaining: '0公里',
    trackPoints: [
      { latitude: 32.0603, longitude: 118.7969, time: '2024-06-09 18:00' },
      { latitude: 31.5000, longitude: 117.5000, time: '2024-06-10 02:00' },
      { latitude: 31.0000, longitude: 116.0000, time: '2024-06-10 10:00' },
      { latitude: 30.5928, longitude: 114.3055, time: '2024-06-11 06:00' }
    ],
    waybillNos: ['SY202406080002']
  }
];

export const getTrackingByShipName = (shipName: string): ShipTracking | undefined => {
  return mockTracking.find(t => t.shipName === shipName);
};

export const getTrackingByWaybillNo = (waybillNo: string): ShipTracking | undefined => {
  return mockTracking.find(t => t.waybillNos.includes(waybillNo));
};
