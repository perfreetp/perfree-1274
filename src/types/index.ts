export interface Waybill {
  id: string
  cargoType: string
  originStation: string
  destinationStation: string
  vehicleType: string
  vehicleCount: number
  weight: number
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'in_transit' | 'arrived'
  estimatedCost: number
  createdAt: string
  shipper?: string
  consignee?: string
}

export interface TrackingNode {
  id: string
  waybillId: string
  station: string
  time: string
  status: 'passed' | 'current' | 'upcoming'
  description: string
}

export interface CostItem {
  id: string
  waybillId: string
  category: string
  amount: number
  description: string
}

export interface CostTrial {
  id: string
  cargoType: string
  originStation: string
  destinationStation: string
  weight: number
  baseCost: number
  loadingCost: number
  otherCost: number
  totalCost: number
  createdAt: string
}

export interface Contact {
  id: string
  name: string
  company: string
  phone: string
  address: string
  type: 'shipper' | 'consignee'
}

export interface ExceptionCase {
  id: string
  waybillId: string
  type: 'damage' | 'shortage' | 'other'
  description: string
  status: 'submitted' | 'processing' | 'resolved'
  images: string[]
  createdAt: string
  reply?: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'service'
  content: string
  time: string
  type: 'text' | 'image'
}

export interface ChatSession {
  id: string
  title: string
  lastMessage: string
  lastTime: string
  unread: number
  messages: ChatMessage[]
}

export interface ReconciliationRecord {
  id: string
  period: string
  totalAmount: number
  status: 'pending' | 'confirmed'
  waybillCount: number
  createdAt: string
  confirmedAt?: string
  downloadUrl?: string
}

export interface InvoiceApplication {
  id: string
  amount: number
  title: string
  type: string
  status: 'pending' | 'approved' | 'issued'
  createdAt: string
  approvedAt?: string
  issuedAt?: string
  invoiceNo?: string
  downloadUrl?: string
}

export interface LoadingAppointment {
  id: string
  waybillId: string
  station: string
  date: string
  timeSlot: string
  method: string
  status: 'scheduled' | 'completed' | 'cancelled'
  warehouseSlot?: string
}

export interface WarehouseSlot {
  station: string
  total: number
  used: number
  available: number
}

export interface Notification {
  id: string
  type: 'system' | 'rate' | 'route' | 'arrival' | 'warning'
  title: string
  content: string
  time: string
  read: boolean
}

export type CargoCategory = {
  id: string
  name: string
  icon: string
  rate: number
}

export type Station = {
  code: string
  name: string
  region: string
}

export type VehicleType = {
  id: string
  name: string
  capacity: number
  rate: number
}
