import type { Waybill, TrackingNode, CostItem, Contact, ExceptionCase, ChatSession, ReconciliationRecord, InvoiceApplication, LoadingAppointment, WarehouseSlot, Notification, CargoCategory, Station, VehicleType, CostTrial } from '@/types'

export const cargoCategories: CargoCategory[] = [
  { id: 'coal', name: '煤炭', icon: '🔥', rate: 0.085 },
  { id: 'ore', name: '矿石', icon: '⛏️', rate: 0.092 },
  { id: 'steel', name: '钢铁', icon: '🔩', rate: 0.105 },
  { id: 'grain', name: '粮食', icon: '🌾', rate: 0.098 },
  { id: 'chemical', name: '化工', icon: '🧪', rate: 0.125 },
  { id: 'cement', name: '水泥', icon: '🏗️', rate: 0.088 },
  { id: 'timber', name: '木材', icon: '🪵', rate: 0.095 },
  { id: 'fertilizer', name: '化肥', icon: '🧫', rate: 0.102 },
]

export const stations: Station[] = [
  { code: 'BJN', name: '北京南', region: '华北' },
  { code: 'SHH', name: '上海虹桥', region: '华东' },
  { code: 'GZN', name: '广州南', region: '华南' },
  { code: 'CDB', name: '成都北', region: '西南' },
  { code: 'WHD', name: '武汉东', region: '华中' },
  { code: 'XAD', name: '西安东', region: '西北' },
  { code: 'SYN', name: '沈阳南', region: '东北' },
  { code: 'ZBD', name: '郑州东', region: '华中' },
  { code: 'JND', name: '济南东', region: '华东' },
  { code: 'TYD', name: '太原东', region: '华北' },
  { code: 'HHT', name: '呼和浩特', region: '华北' },
  { code: 'LZD', name: '兰州东', region: '西北' },
  { code: 'KMD', name: '昆明东', region: '西南' },
  { code: 'NJD', name: '南京东', region: '华东' },
  { code: 'HFD', name: '合肥东', region: '华东' },
]

export const vehicleTypes: VehicleType[] = [
  { id: 'open', name: '敞车', capacity: 60, rate: 1.0 },
  { id: 'covered', name: '棚车', capacity: 58, rate: 1.15 },
  { id: 'tank', name: '罐车', capacity: 50, rate: 1.35 },
  { id: 'flat', name: '平车', capacity: 65, rate: 1.1 },
  { id: 'hopper', name: '漏斗车', capacity: 62, rate: 1.05 },
]

export const mockWaybills: Waybill[] = [
  {
    id: 'YD2026060001',
    cargoType: 'coal',
    originStation: 'BJN',
    destinationStation: 'SHH',
    vehicleType: 'open',
    vehicleCount: 5,
    weight: 300,
    status: 'in_transit',
    estimatedCost: 42800,
    createdAt: '2026-06-08 09:30',
    shipper: '华北煤炭集团',
    consignee: '上海电力有限公司',
  },
  {
    id: 'YD2026060002',
    cargoType: 'steel',
    originStation: 'WHD',
    destinationStation: 'GZN',
    vehicleType: 'flat',
    vehicleCount: 3,
    weight: 180,
    status: 'pending',
    estimatedCost: 28350,
    createdAt: '2026-06-09 14:20',
    shipper: '武汉钢铁有限公司',
    consignee: '广州建设集团',
  },
  {
    id: 'YD2026060003',
    cargoType: 'grain',
    originStation: 'SYN',
    destinationStation: 'CDB',
    vehicleType: 'covered',
    vehicleCount: 8,
    weight: 450,
    status: 'approved',
    estimatedCost: 61500,
    createdAt: '2026-06-10 08:15',
    shipper: '东北粮食集团',
    consignee: '成都粮油公司',
  },
  {
    id: 'YD2026060004',
    cargoType: 'chemical',
    originStation: 'NJD',
    destinationStation: 'ZBD',
    vehicleType: 'tank',
    vehicleCount: 4,
    weight: 200,
    status: 'arrived',
    estimatedCost: 35200,
    createdAt: '2026-06-05 11:00',
    shipper: '南京化工集团',
    consignee: '郑州化工贸易公司',
  },
  {
    id: 'YD2026060005',
    cargoType: 'ore',
    originStation: 'TYD',
    destinationStation: 'XAD',
    vehicleType: 'open',
    vehicleCount: 10,
    weight: 600,
    status: 'rejected',
    estimatedCost: 76800,
    createdAt: '2026-06-10 16:45',
    shipper: '山西矿业集团',
    consignee: '西安建材公司',
  },
]

export const mockTrackingNodes: Record<string, TrackingNode[]> = {
  YD2026060001: [
    { id: '1', waybillId: 'YD2026060001', station: '北京南', time: '2026-06-08 10:00', status: 'passed', description: '已发车' },
    { id: '2', waybillId: 'YD2026060001', station: '济南东', time: '2026-06-09 02:30', status: 'passed', description: '经停中转' },
    { id: '3', waybillId: 'YD2026060001', station: '南京东', time: '2026-06-09 18:00', status: 'current', description: '当前在途' },
    { id: '4', waybillId: 'YD2026060001', station: '上海虹桥', time: '预计 06-11 06:00', status: 'upcoming', description: '预计到达' },
  ],
  YD2026060002: [
    { id: '5', waybillId: 'YD2026060002', station: '武汉东', time: '待发运', status: 'upcoming', description: '等待装车' },
    { id: '6', waybillId: 'YD2026060002', station: '长沙南', time: '-', status: 'upcoming', description: '经停中转' },
    { id: '7', waybillId: 'YD2026060002', station: '广州南', time: '-', status: 'upcoming', description: '终到站' },
  ],
  YD2026060003: [
    { id: 'tn3-1', waybillId: 'YD2026060003', station: '沈阳南', time: '预计 06-12 10:00', status: 'upcoming', description: '计划发车' },
    { id: 'tn3-2', waybillId: 'YD2026060003', station: '沈阳南', time: '待装车', status: 'upcoming', description: '等待装车发运' },
    { id: 'tn3-3', waybillId: 'YD2026060003', station: '北京南', time: '-', status: 'upcoming', description: '经停中转' },
    { id: 'tn3-4', waybillId: 'YD2026060003', station: '郑州东', time: '-', status: 'upcoming', description: '经停中转' },
    { id: 'tn3-5', waybillId: 'YD2026060003', station: '成都北', time: '-', status: 'upcoming', description: '终到站' },
  ],
  YD2026060004: [
    { id: '8', waybillId: 'YD2026060004', station: '南京东', time: '2026-06-05 12:00', status: 'passed', description: '已发车' },
    { id: '9', waybillId: 'YD2026060004', station: '合肥东', time: '2026-06-05 20:00', status: 'passed', description: '经停中转' },
    { id: '10', waybillId: 'YD2026060004', station: '郑州东', time: '2026-06-06 08:00', status: 'passed', description: '已到达' },
  ],
  YD2026060005: [
    { id: 'tn5-1', waybillId: 'YD2026060005', station: '太原东', time: '审核未通过', status: 'upcoming', description: '运单已驳回，请重新提交' },
    { id: 'tn5-2', waybillId: 'YD2026060005', station: '西安东', time: '-', status: 'upcoming', description: '终到站' },
  ],
}

export const mockCostItems: Record<string, CostItem[]> = {
  YD2026060001: [
    { id: 'c1', waybillId: 'YD2026060001', category: '运费', amount: 35700, description: '基本运费 300吨 × 0.085元/吨公里 × 1400公里' },
    { id: 'c2', waybillId: 'YD2026060001', category: '装卸费', amount: 4500, description: '装车费 300吨 × 8元/吨 + 卸车费 300吨 × 7元/吨' },
    { id: 'c3', waybillId: 'YD2026060001', category: '仓储费', amount: 1800, description: '中转站仓储 1天 × 5车 × 360元/车' },
    { id: 'c4', waybillId: 'YD2026060001', category: '其他费', amount: 800, description: '过轨费、取送车费等' },
  ],
  YD2026060002: [
    { id: 'c21', waybillId: 'YD2026060002', category: '运费', amount: 22680, description: '基本运费 180吨 × 0.105元/吨公里 × 1200公里' },
    { id: 'c22', waybillId: 'YD2026060002', category: '装卸费', amount: 2700, description: '平车装卸费 180吨 × 15元/吨' },
    { id: 'c23', waybillId: 'YD2026060002', category: '其他费', amount: 2970, description: '加固材料费、取送车费等' },
  ],
  YD2026060003: [
    { id: 'c31', waybillId: 'YD2026060003', category: '运费', amount: 52920, description: '基本运费 450吨 × 0.098元/吨公里 × 1200公里' },
    { id: 'c32', waybillId: 'YD2026060003', category: '装卸费', amount: 6750, description: '棚车装卸费 450吨 × 15元/吨' },
    { id: 'c33', waybillId: 'YD2026060003', category: '其他费', amount: 1830, description: '棚车使用费、取送车费' },
  ],
  YD2026060004: [
    { id: 'c5', waybillId: 'YD2026060004', category: '运费', amount: 29400, description: '基本运费 200吨 × 0.125元/吨公里 × 1176公里' },
    { id: 'c6', waybillId: 'YD2026060004', category: '装卸费', amount: 4000, description: '罐车装卸费' },
    { id: 'c7', waybillId: 'YD2026060004', category: '其他费', amount: 1800, description: '危险品附加费、取送车费' },
  ],
  YD2026060005: [
    { id: 'c51', waybillId: 'YD2026060005', category: '运费', amount: 66240, description: '基本运费 600吨 × 0.092元/吨公里 × 1200公里' },
    { id: 'c52', waybillId: 'YD2026060005', category: '装卸费', amount: 9000, description: '敞车装卸费 600吨 × 15元/吨' },
    { id: 'c53', waybillId: 'YD2026060005', category: '其他费', amount: 1560, description: '取送车费等' },
  ],
}

export const mockContacts: Contact[] = [
  { id: 'ct1', name: '张建国', company: '华北煤炭集团', phone: '010-87654321', address: '北京市丰台区货运站东路1号', type: 'shipper' },
  { id: 'ct2', name: '李明辉', company: '上海电力有限公司', phone: '021-12345678', address: '上海市浦东新区电力路88号', type: 'consignee' },
  { id: 'ct3', name: '王大伟', company: '武汉钢铁有限公司', phone: '027-55556666', address: '武汉市青山区钢铁大道100号', type: 'shipper' },
  { id: 'ct4', name: '陈丽华', company: '广州建设集团', phone: '020-33334444', address: '广州市天河区建设路50号', type: 'consignee' },
  { id: 'ct5', name: '赵德强', company: '东北粮食集团', phone: '024-77778888', address: '沈阳市沈河区粮贸路22号', type: 'shipper' },
  { id: 'ct6', name: '刘晓芳', company: '成都粮油公司', phone: '028-99990000', address: '成都市武侯区粮油市场A区', type: 'consignee' },
]

export const mockExceptions: ExceptionCase[] = [
  {
    id: 'ex1',
    waybillId: 'YD2026060004',
    type: 'shortage',
    description: '到站清点发现化肥短少3吨，原发200吨，实到197吨',
    status: 'processing',
    images: [],
    createdAt: '2026-06-07 10:30',
    reply: '已安排现场核查，预计3个工作日内出具处理意见',
  },
  {
    id: 'ex2',
    waybillId: 'YD2026060001',
    type: 'damage',
    description: '煤炭中转后发现部分包装破损',
    status: 'submitted',
    images: [],
    createdAt: '2026-06-09 15:00',
  },
]

export const mockChatSessions: ChatSession[] = [
  {
    id: 'cs1',
    title: 'YD2026060004 货物短少',
    lastMessage: '已安排现场核查，预计3个工作日内出具处理意见',
    lastTime: '06-07 11:20',
    unread: 1,
    messages: [
      { id: 'm1', sender: 'user', content: '你好，我方运单 YD2026060004 到站清点发现短少3吨，请协助处理', time: '06-07 10:30', type: 'text' },
      { id: 'm2', sender: 'service', content: '您好，已收到您的反馈。请提供到站货物清点单照片，我们将尽快核实处理。', time: '06-07 10:35', type: 'text' },
      { id: 'm3', sender: 'user', content: '清点单已上传至申诉工单', time: '06-07 10:40', type: 'text' },
      { id: 'm4', sender: 'service', content: '已安排现场核查，预计3个工作日内出具处理意见', time: '06-07 11:20', type: 'text' },
    ],
  },
  {
    id: 'cs2',
    title: '运价咨询',
    lastMessage: '目前化工品运价为0.125元/吨公里',
    lastTime: '06-06 16:00',
    unread: 0,
    messages: [
      { id: 'm5', sender: 'user', content: '请问目前化工品从南京到郑州的运价是多少？', time: '06-06 15:50', type: 'text' },
      { id: 'm6', sender: 'service', content: '目前化工品运价为0.125元/吨公里，南京到郑州里程约1176公里。如有批量发运需求，可申请优惠费率。', time: '06-06 16:00', type: 'text' },
    ],
  },
]

export const mockReconciliations: ReconciliationRecord[] = [
  { id: 'rc1', period: '2026年5月', totalAmount: 256800, status: 'confirmed', waybillCount: 8, createdAt: '2026-06-01', confirmedAt: '2026-06-02', downloadUrl: 'reconciliation-rc1.pdf' },
  { id: 'rc2', period: '2026年4月', totalAmount: 198500, status: 'confirmed', waybillCount: 6, createdAt: '2026-05-02', confirmedAt: '2026-05-05', downloadUrl: 'reconciliation-rc2.pdf' },
  { id: 'rc3', period: '2026年6月', totalAmount: 78000, status: 'pending', waybillCount: 3, createdAt: '2026-06-10' },
]

export const mockInvoices: InvoiceApplication[] = [
  { id: 'inv1', amount: 256800, title: '华北煤炭集团', type: '增值税专用发票', status: 'issued', createdAt: '2026-06-02', approvedAt: '2026-06-03', issuedAt: '2026-06-05', invoiceNo: 'FP20260605001', downloadUrl: 'invoice-inv1.pdf' },
  { id: 'inv2', amount: 198500, title: '华北煤炭集团', type: '增值税专用发票', status: 'approved', createdAt: '2026-05-05', approvedAt: '2026-05-06' },
  { id: 'inv3', amount: 78000, title: '华北煤炭集团', type: '增值税专用发票', status: 'pending', createdAt: '2026-06-10' },
]

export const mockLoadingAppointments: LoadingAppointment[] = [
  { id: 'la1', waybillId: 'YD2026060003', station: '沈阳南', date: '2026-06-12', timeSlot: '08:00-12:00', method: '机械装载', status: 'scheduled', warehouseSlot: 'A-03' },
  { id: 'la2', waybillId: 'YD2026060002', station: '武汉东', date: '2026-06-13', timeSlot: '14:00-18:00', method: '机械装载', status: 'scheduled' },
]

export const mockWarehouseSlots: WarehouseSlot[] = [
  { station: '北京南', total: 20, used: 14, available: 6 },
  { station: '上海虹桥', total: 15, used: 10, available: 5 },
  { station: '广州南', total: 18, used: 12, available: 6 },
  { station: '成都北', total: 12, used: 8, available: 4 },
  { station: '武汉东', total: 16, used: 9, available: 7 },
  { station: '沈阳南', total: 10, used: 3, available: 7 },
  { station: '郑州东', total: 14, used: 11, available: 3 },
]

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'arrival', title: '到站通知', content: '运单 YD2026060004 货物已到达郑州东站，请及时安排卸车', time: '2026-06-06 08:00', read: true },
  { id: 'n2', type: 'warning', title: '滞留预警', content: '运单 YD2026060001 货物在南京东站中转滞留超过12小时', time: '2026-06-09 20:00', read: false },
  { id: 'n3', type: 'system', title: '系统公告', content: '6月15日起部分线路运价调整，详情请查看运价公告', time: '2026-06-08 09:00', read: true },
  { id: 'n4', type: 'rate', title: '运价调整', content: '化工品类运价上调5%，自2026年6月15日起执行', time: '2026-06-07 14:00', read: false },
  { id: 'n5', type: 'route', title: '线路变更', content: '武汉至广州线路因施工临时调整，预计6月20日恢复', time: '2026-06-06 10:00', read: true },
]

export const mockCostTrials: CostTrial[] = [
  {
    id: 'CT20260600001',
    cargoType: 'coal',
    originStation: '北京南',
    destinationStation: '上海虹桥',
    weight: 300,
    baseCost: 35700,
    loadingCost: 4500,
    otherCost: 2600,
    totalCost: 42800,
    createdAt: '2026-06-08 09:20',
  },
  {
    id: 'CT20260600002',
    cargoType: 'steel',
    originStation: '武汉东',
    destinationStation: '广州南',
    weight: 180,
    baseCost: 22680,
    loadingCost: 2700,
    otherCost: 2970,
    totalCost: 28350,
    createdAt: '2026-06-09 14:05',
  },
  {
    id: 'CT20260600003',
    cargoType: 'grain',
    originStation: '沈阳南',
    destinationStation: '成都北',
    weight: 450,
    baseCost: 52920,
    loadingCost: 6750,
    otherCost: 1830,
    totalCost: 61500,
    createdAt: '2026-06-10 08:05',
  },
]
