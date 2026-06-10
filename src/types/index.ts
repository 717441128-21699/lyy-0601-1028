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
export type FeedbackStatus = 'pending' | 'processing' | 'need_more' | 'resolved';

export interface FeedbackHistory {
  id: string;
  feedbackId: string;
  action: 'submit' | 'process' | 'request_more' | 'reply' | 'resolve';
  actionText: string;
  operator: string;
  time: string;
  content: string;
  photos?: string[];
}

export interface FeedbackRecord {
  id: string;
  type: FeedbackType;
  typeText: string;
  waybillNo: string;
  description: string;
  photos: string[];
  status: FeedbackStatus;
  statusText: string;
  createTime: string;
  reply?: string;
  replyTime?: string;
  history: FeedbackHistory[];
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
  filePath?: string;
  fileType?: 'pdf' | 'image';
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

export type NotificationType = 'delay' | 'departure' | 'arrival' | 'berth';

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  typeText: string;
  shipName: string;
  route: string;
  startPort: string;
  endPort: string;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  originalTime?: string;
  estimatedTime?: string;
}

export interface BillSummary {
  id: string;
  waybillNo: string;
  shipName: string;
  route: string;
  startPort: string;
  endPort: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  statusText: string;
  createTime: string;
  dueDate: string;
  expenseIds: string[];
  paymentRecords: PaymentRecord[];
  billFileUrl?: string;
  generateTime?: string;
}
