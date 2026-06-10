export type NodeStatus = 'completed' | 'current' | 'pending';

export interface WaybillNode {
  id: string;
  name: string;
  status: NodeStatus;
  time?: string;
  location?: string;
  operator?: string;
  remark?: string;
}

export interface WaybillInfo {
  id: string;
  waybillNo: string;
  containerNo: string;
  shipName: string;
  route: string;
  startPort: string;
  endPort: string;
  status: 'transit' | 'completed' | 'exception' | 'pending';
  statusText: string;
  currentNode: number;
  nodes: WaybillNode[];
  cargoName: string;
  cargoWeight: string;
  cargoVolume: string;
  sender: string;
  receiver: string;
  createTime: string;
  estimatedArrivalTime: string;
}

export interface Subscription {
  id: string;
  route: string;
  shipName: string;
  startPort: string;
  endPort: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  status: 'normal' | 'delayed' | 'cancelled';
  statusText: string;
  notifyTypes: string[];
  isSubscribed: boolean;
}

export interface TrackPoint {
  latitude: number;
  longitude: number;
  time: string;
}

export interface ShipTracking {
  id: string;
  shipName: string;
  mmsi: string;
  currentLatitude: number;
  currentLongitude: number;
  currentSpeed: string;
  currentCourse: string;
  status: 'sailing' | 'moored' | 'anchored';
  statusText: string;
  startPort: string;
  endPort: string;
  estimatedArrivalTime: string;
  distanceRemaining: string;
  trackPoints: TrackPoint[];
  waybillNos: string[];
}

export type FeedbackType = 'damage' | 'missing' | 'document' | 'other';

export interface FeedbackRecord {
  id: string;
  type: FeedbackType;
  typeText: string;
  waybillNo: string;
  description: string;
  photos: string[];
  status: 'pending' | 'processing' | 'resolved';
  statusText: string;
  createTime: string;
  reply?: string;
  replyTime?: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  type: 'freight' | 'port' | 'detention' | 'other';
  remark?: string;
}

export interface ExpenseInfo {
  id: string;
  waybillNo: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  statusText: string;
  items: ExpenseItem[];
  createTime: string;
  dueDate: string;
  paymentVoucher?: string;
  paidTime?: string;
}

export interface EReceipt {
  id: string;
  waybillNo: string;
  containerNo: string;
  shipName: string;
  route: string;
  startPort: string;
  endPort: string;
  cargoName: string;
  sender: string;
  receiver: string;
  nodes: WaybillNode[];
  generateTime: string;
  qrCode?: string;
}

export interface PaymentRecord {
  id: string;
  expenseId: string;
  waybillNo: string;
  amount: number;
  paymentMethod: string;
  paymentTime: string;
  voucherUrl: string;
  remark?: string;
}
