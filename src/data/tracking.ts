import type { ShipTracking } from '@/types';

export const mockTrackings: ShipTracking[] = [
  {
    id: 't1',
    shipName: '中远之星',
    mmsi: '413300000',
    currentLatitude: 31.8500,
    currentLongitude: 118.7500,
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
      { latitude: 31.5000, longitude: 120.5000, time: '2024-06-12 02:00' },
      { latitude: 31.7500, longitude: 119.8000, time: '2024-06-12 06:00' },
      { latitude: 31.8500, longitude: 119.0000, time: '2024-06-12 10:00' },
      { latitude: 31.8500, longitude: 118.7500, time: '2024-06-12 14:00' }
    ],
    waybillNos: ['SY202406100001']
  },
  {
    id: 't2',
    shipName: '长江明珠',
    mmsi: '413300001',
    currentLatitude: 30.6200,
    currentLongitude: 114.5500,
    currentSpeed: '0节',
    currentCourse: '0°',
    status: 'moored',
    statusText: '已靠泊',
    startPort: '南京港',
    endPort: '武汉阳逻港',
    estimatedArrivalTime: '2024-06-11 06:00',
    distanceRemaining: '0公里',
    trackPoints: [
      { latitude: 32.1500, longitude: 118.7000, time: '2024-06-09 18:00' },
      { latitude: 31.5000, longitude: 117.5000, time: '2024-06-10 02:00' },
      { latitude: 31.0000, longitude: 116.0000, time: '2024-06-10 10:00' },
      { latitude: 30.6200, longitude: 114.5500, time: '2024-06-11 06:00' }
    ],
    waybillNos: ['SY202406080002']
  },
  {
    id: 't3',
    shipName: '东方之星',
    mmsi: '413300002',
    currentLatitude: 31.2304,
    currentLongitude: 121.4737,
    currentSpeed: '0节',
    currentCourse: '0°',
    status: 'anchored',
    statusText: '锚泊中',
    startPort: '上海港',
    endPort: '武汉阳逻港',
    estimatedArrivalTime: '2024-06-16 18:00',
    distanceRemaining: '980公里',
    trackPoints: [
      { latitude: 31.2304, longitude: 121.4737, time: '2024-06-12 08:00' }
    ],
    waybillNos: ['SY202406120004']
  }
];

export const portCoordinates: Record<string, { latitude: number; longitude: number }> = {
  '上海港': { latitude: 31.2304, longitude: 121.4737 },
  '重庆果园港': { latitude: 29.6200, longitude: 106.5800 },
  '南京港': { latitude: 32.1500, longitude: 118.7000 },
  '武汉阳逻港': { latitude: 30.6200, longitude: 114.5500 },
  '宁波港': { latitude: 29.9200, longitude: 121.5500 },
  '广州黄埔港': { latitude: 23.1000, longitude: 113.4200 }
};

export const getTrackingByShipName = (shipName: string): ShipTracking | undefined => {
  return mockTrackings.find(t => t.shipName === shipName);
};

export const getTrackingByWaybillNo = (waybillNo: string): ShipTracking | undefined => {
  return mockTrackings.find(t => t.waybillNos.includes(waybillNo));
};
