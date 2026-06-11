import { useState, useMemo } from 'react'
import {
  Calculator,
  FileText,
  Receipt,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Save,
  Download,
  Search,
  Calendar,
  Clock,
  CheckCheck,
  FileBadge2,
  Package,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useStore } from '@/store'
import { cargoCategories, stations, mockCostItems } from '@/data/mockData'
import { cn } from '@/lib/utils'
import type { InvoiceApplication, CostTrial, ReconciliationRecord, Waybill, CostItem } from '@/types'

type TabKey = 'calculate' | 'history' | 'detail' | 'reconcile' | 'invoice'

const parseDate = (str: string): number => {
  if (!str) return 0
  const s = str.replace(/\//g, '-').replace(/年|月/g, '-').replace(/日/g, '')
  const dt = new Date(s)
  return dt.getTime()
}

const toDateInput = (dateStr: string): string => {
  const ts = parseDate(dateStr)
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const downloadCSV = (filename: string, rows: string[][]) => {
  const bom = '\uFEFF'
  const csv = bom + rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const buildReconciliationRows = (recon: ReconciliationRecord, waybills: Waybill[]): string[][] => {
  const header = ['对账单号', recon.id]
  const period = ['对账期间', recon.period]
  const count = ['运单笔数', `${recon.waybillCount} 笔`]
  const created = ['生成日期', recon.createdAt]
  const confirmed = ['确认日期', recon.confirmedAt || '-']
  const total = ['对账总金额', `¥${recon.totalAmount.toLocaleString()}`]
  const blank = ['']
  const tableHeader = ['序号', '运单号', '发站', '到站', '货类', '重量(吨)', '状态', '金额(元)']
  const dataRows = waybills.map((w, idx) => {
    const items = mockCostItems[w.id] || []
    const sum = items.reduce((s, i) => s + i.amount, 0) || w.estimatedCost
    const cg = cargoCategories.find((c) => c.id === w.cargoType)
    const statusMap: Record<string, string> = { pending: '待审核', approved: '已审核', in_transit: '在途', arrived: '已到站' }
    return [
      String(idx + 1),
      w.id,
      w.originStation,
      w.destinationStation,
      cg ? `${cg.icon} ${cg.name}` : w.cargoType,
      String(w.weight),
      statusMap[w.status] || w.status,
      String(sum),
    ]
  })
  const footer = ['合计', '', '', '', '', '', '', `¥${recon.totalAmount.toLocaleString()}`]
  return [header, period, count, created, confirmed, total, blank, tableHeader, ...dataRows, footer]
}

const buildInvoiceRows = (inv: InvoiceApplication, waybills: Waybill[]): string[][] => {
  const header = ['发票号', inv.invoiceNo || inv.id]
  const type = ['发票类型', inv.type]
  const title = ['开票抬头', inv.title]
  const amount = ['开票金额', `¥${inv.amount.toLocaleString()}`]
  const created = ['申请日期', inv.createdAt]
  const approved = ['审核日期', inv.approvedAt || '-']
  const issued = ['开票日期', inv.issuedAt || '-']
  const blank = ['']
  const tableHeader = ['序号', '运单号', '费用类别', '说明', '金额(元)']
  const dataRows: string[][] = []
  let idx = 1
  waybills.forEach((w) => {
    const items: CostItem[] = mockCostItems[w.id] || (w.estimatedCost ? [
      { id: 'auto-1', waybillId: w.id, category: '运费', amount: Math.round(w.estimatedCost * 0.82), description: `预估运费 ${w.weight}吨` },
      { id: 'auto-2', waybillId: w.id, category: '装卸费', amount: w.weight * 15, description: `装卸费 ${w.weight}吨 × 15元/吨` },
      { id: 'auto-3', waybillId: w.id, category: '其他费', amount: Math.max(0, w.estimatedCost - Math.round(w.estimatedCost * 0.82) - w.weight * 15), description: '其他预估费用' },
    ] : [])
    items.forEach((it) => {
      dataRows.push([String(idx), w.id, it.category, it.description, String(it.amount)])
      idx++
    })
  })
  const footer = ['合计', '', '', '', `¥${inv.amount.toLocaleString()}`]
  return [header, type, title, amount, created, approved, issued, blank, tableHeader, ...dataRows, footer]
}

export default function Cost() {
  const [activeTab, setActiveTab] = useState<TabKey>('calculate')
  const waybills = useStore((s) => s.waybills)
  const reconciliations = useStore((s) => s.reconciliations)
  const invoices = useStore((s) => s.invoices)
  const contacts = useStore((s) => s.contacts)
  const addInvoice = useStore((s) => s.addInvoice)
  const updateInvoiceStatus = useStore((s) => s.updateInvoiceStatus)
  const confirmReconciliation = useStore((s) => s.confirmReconciliation)
  const costTrials = useStore((s) => s.costTrials)
  const addCostTrial = useStore((s) => s.addCostTrial)
  const deleteCostTrial = useStore((s) => s.deleteCostTrial)

  const [calcCargo, setCalcCargo] = useState('')
  const [calcOrigin, setCalcOrigin] = useState('')
  const [calcDest, setCalcDest] = useState('')
  const [calcWeight, setCalcWeight] = useState(0)
  const [expandedRecon, setExpandedRecon] = useState<string | null>(null)
  const [invoiceTitle, setInvoiceTitle] = useState('')
  const [invoiceType, setInvoiceType] = useState('增值税专用发票')
  const [invoiceAmount, setInvoiceAmount] = useState(0)
  const [savedToast, setSavedToast] = useState(false)
  const [deletedToast, setDeletedToast] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [invoiceWaybillId, setInvoiceWaybillId] = useState('')

  const [detailWaybillQuery, setDetailWaybillQuery] = useState('')
  const [detailDateFrom, setDetailDateFrom] = useState('')
  const [detailDateTo, setDetailDateTo] = useState('')

  const [historyQuery, setHistoryQuery] = useState('')
  const [historyDateFrom, setHistoryDateFrom] = useState('')
  const [historyDateTo, setHistoryDateTo] = useState('')

  const tabs: { key: TabKey; label: string; icon: typeof Calculator }[] = [
    { key: 'calculate', label: '运价计算', icon: Calculator },
    { key: 'history', label: '试算历史', icon: Clock },
    { key: 'detail', label: '费用明细', icon: FileText },
    { key: 'reconcile', label: '电子对账', icon: CheckCircle2 },
    { key: 'invoice', label: '发票申请', icon: Receipt },
  ]

  const defaultTitle = contacts.find((c) => c.type === 'shipper')?.company || ''

  const cargo = cargoCategories.find((c) => c.id === calcCargo)
  const calcDistance = 1200
  const baseCost = calcWeight && cargo ? Math.round(calcWeight * cargo.rate * calcDistance) : 0
  const loadingCost = calcWeight ? Math.round(calcWeight * 15) : 0
  const otherCost = calcWeight ? Math.round(calcWeight * 2.5) : 0
  const totalCost = baseCost + loadingCost + otherCost

  const allVisibleWaybills = waybills.filter((w) => w.status !== 'rejected' && w.status !== 'draft')
  const filteredDetailWaybills = useMemo(() => allVisibleWaybills.filter((w) => {
    if (detailWaybillQuery && !w.id.toLowerCase().includes(detailWaybillQuery.toLowerCase())) return false
    const wts = parseDate(w.createdAt)
    if (detailDateFrom && wts < parseDate(detailDateFrom + ' 00:00:00')) return false
    if (detailDateTo && wts > parseDate(detailDateTo + ' 23:59:59')) return false
    return true
  }), [allVisibleWaybills, detailWaybillQuery, detailDateFrom, detailDateTo])

  const filteredTrials = useMemo(() => costTrials.filter((t) => {
    if (historyQuery) {
      const q = historyQuery.toLowerCase()
      if (!t.id.toLowerCase().includes(q) &&
          !t.originStation.includes(historyQuery) &&
          !t.destinationStation.includes(historyQuery)) return false
    }
    const tts = parseDate(t.createdAt)
    if (historyDateFrom && tts < parseDate(historyDateFrom + ' 00:00:00')) return false
    if (historyDateTo && tts > parseDate(historyDateTo + ' 23:59:59')) return false
    return true
  }), [costTrials, historyQuery, historyDateFrom, historyDateTo])

  const handleSaveTrial = () => {
    if (!calcCargo || !calcOrigin || !calcDest || !calcWeight) return
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const isoDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    const trial: CostTrial = {
      id: `CT${Date.now()}`,
      cargoType: calcCargo,
      originStation: calcOrigin,
      destinationStation: calcDest,
      weight: calcWeight,
      baseCost,
      loadingCost,
      otherCost,
      totalCost,
      createdAt: isoDate,
    }
    addCostTrial(trial)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }

  const handleApplyInvoice = () => {
    if (!invoiceTitle || !invoiceAmount) return
    const invoice: InvoiceApplication = {
      id: `INV${Date.now()}`,
      amount: invoiceAmount,
      title: invoiceTitle,
      type: invoiceType,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('zh-CN'),
      waybillId: invoiceWaybillId || undefined,
    }
    addInvoice(invoice)
    setInvoiceTitle('')
    setInvoiceAmount(0)
    setInvoiceWaybillId('')
  }

  const handleQuickInvoice = (waybill: Waybill, totalAmount: number) => {
    setInvoiceWaybillId(waybill.id)
    setInvoiceAmount(totalAmount)
    setInvoiceTitle(defaultTitle)
    setActiveTab('invoice')
  }

  const downloadReconciliation = (recon: ReconciliationRecord) => {
    const relatedWaybills = recon.waybillIds
      .map((id) => waybills.find((w) => w.id === id))
      .filter((w): w is Waybill => !!w)
    const rows = buildReconciliationRows(recon, relatedWaybills)
    downloadCSV(`对账单_${recon.id}_${recon.period}.csv`, rows)
  }

  const downloadInvoiceFile = (inv: InvoiceApplication) => {
    const related = inv.waybillId
      ? waybills.filter((w) => w.id === inv.waybillId)
      : waybills.slice(0, 2)
    const rows = buildInvoiceRows(inv, related)
    downloadCSV(`发票_${inv.id}.csv`, rows)
  }

  const handleDeleteTrial = (id: string) => {
    setConfirmDeleteId(id)
  }

  const confirmDeleteTrial = () => {
    if (!confirmDeleteId) return
    deleteCostTrial(confirmDeleteId)
    setConfirmDeleteId(null)
    setDeletedToast(true)
    setTimeout(() => setDeletedToast(false), 2000)
  }

  const invoiceStatusMap: Record<string, { label: string; color: string; step: number }> = {
    pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-700', step: 0 },
    approved: { label: '已审核', color: 'bg-blue-100 text-blue-700', step: 1 },
    issued: { label: '已开票', color: 'bg-green-100 text-green-700', step: 2 },
  }

  const invoiceSteps = ['提交申请', '财务审核', '开具发票']

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      {savedToast && (
        <div className="fixed top-20 right-10 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 flex items-center gap-2 animate-pulse">
          <CheckCheck size={16} /> 试算记录已保存
        </div>
      )}
      {deletedToast && (
        <div className="fixed top-20 right-10 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 flex items-center gap-2 animate-pulse">
          <Trash2 size={16} /> 试算记录已删除
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">确认删除试算记录</h3>
                <p className="text-xs text-gray-500 mt-0.5">编号：{confirmDeleteId}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              删除后无法恢复，确定要删除这条试算记录吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 btn-secondary py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteTrial}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-100 pb-0 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-rail-500 text-rail-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'calculate' && (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 card p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-800">运价试算参数</h3>
            <div>
              <label className="label-text">货类</label>
              <select className="input-field" value={calcCargo} onChange={(e) => setCalcCargo(e.target.value)}>
                <option value="">请选择货类</option>
                {cargoCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">发站</label>
                <select className="input-field" value={calcOrigin} onChange={(e) => setCalcOrigin(e.target.value)}>
                  <option value="">请选择发站</option>
                  {stations.map((s) => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">到站</label>
                <select className="input-field" value={calcDest} onChange={(e) => setCalcDest(e.target.value)}>
                  <option value="">请选择到站</option>
                  {stations.map((s) => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label-text">重量（吨）</label>
              <input
                type="number"
                className="input-field"
                value={calcWeight || ''}
                onChange={(e) => setCalcWeight(Number(e.target.value))}
                placeholder="请输入重量"
              />
            </div>
            <button
              onClick={handleSaveTrial}
              disabled={!calcCargo || !calcOrigin || !calcDest || !calcWeight}
              className="btn-copper w-full flex items-center justify-center gap-2"
            >
              <Save size={16} /> 保存本次试算结果
            </button>
          </div>

          <div className="col-span-2 card p-6 h-fit sticky top-0">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-copper-500 rounded-full" />
              试算结果
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">货类</span>
                <span className="font-medium">{cargo ? `${cargo.icon} ${cargo.name}` : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">发站</span>
                <span className="font-medium">{calcOrigin || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">到站</span>
                <span className="font-medium">{calcDest || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">里程</span>
                <span className="font-medium">约 {calcDistance} 公里</span>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">基本运费</span>
                  <span>¥{baseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">装卸费</span>
                  <span>¥{loadingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">其他费用</span>
                  <span>¥{otherCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-gray-700">预估总额</span>
                  <span className="text-2xl font-bold text-copper-600">¥{totalCost.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">* 实际费用以最终结算为准</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card p-5">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="relative col-span-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-8 text-sm"
                placeholder="搜索单号/站点"
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Calendar size={14} />
              <input type="date" className="input-field text-sm" value={historyDateFrom} onChange={(e) => setHistoryDateFrom(e.target.value)} />
            </div>
            <span className="text-gray-400 text-center self-center">至</span>
            <input type="date" className="input-field text-sm" value={historyDateTo} onChange={(e) => setHistoryDateTo(e.target.value)} />
          </div>

          {filteredTrials.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">试算编号</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">货类</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">发站</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">到站</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">重量(吨)</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">运费</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">总费用</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">试算时间</th>
                  <th className="text-center text-xs font-medium text-gray-500 pb-3 w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrials.map((t) => {
                  const cg = cargoCategories.find((c) => c.id === t.cargoType)
                  return (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="py-3 text-sm text-rail-500 font-medium">{t.id}</td>
                      <td className="py-3 text-sm text-gray-700">{cg?.icon} {cg?.name}</td>
                      <td className="py-3 text-sm text-gray-600">{t.originStation}</td>
                      <td className="py-3 text-sm text-gray-600">{t.destinationStation}</td>
                      <td className="py-3 text-sm text-gray-800 text-right">{t.weight}</td>
                      <td className="py-3 text-sm text-gray-600 text-right">¥{t.baseCost.toLocaleString()}</td>
                      <td className="py-3 text-sm text-copper-600 font-semibold text-right">¥{t.totalCost.toLocaleString()}</td>
                      <td className="py-3 text-xs text-gray-400">{t.createdAt}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleDeleteTrial(t.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Clock size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无符合条件的试算记录</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'detail' && (
        <div className="space-y-5">
          <div className="card p-5">
            <div className="grid grid-cols-4 gap-3 mb-2">
              <div className="relative col-span-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-8 text-sm"
                  placeholder="按运单号搜索"
                  value={detailWaybillQuery}
                  onChange={(e) => setDetailWaybillQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar size={14} />
                <input type="date" className="input-field text-sm" value={detailDateFrom} onChange={(e) => setDetailDateFrom(e.target.value)} />
              </div>
              <span className="text-gray-400 text-center self-center">至</span>
              <input type="date" className="input-field text-sm" value={detailDateTo} onChange={(e) => setDetailDateTo(e.target.value)} />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              显示 <span className="text-rail-500 font-medium">{filteredDetailWaybills.length}</span> 条有效运单费用（包含在途、已审核、已到站）
            </p>
          </div>

          {filteredDetailWaybills.length > 0 ? filteredDetailWaybills.map((waybill) => {
            const items = mockCostItems[waybill.id] || (waybill.estimatedCost ? [
              { id: `auto-${waybill.id}-1`, waybillId: waybill.id, category: '运费', amount: Math.round(waybill.estimatedCost * 0.82), description: `预估运费 ${waybill.weight}吨` },
              { id: `auto-${waybill.id}-2`, waybillId: waybill.id, category: '装卸费', amount: waybill.weight * 15, description: `装卸费 ${waybill.weight}吨 × 15元/吨` },
              { id: `auto-${waybill.id}-3`, waybillId: waybill.id, category: '其他费', amount: Math.max(0, waybill.estimatedCost - Math.round(waybill.estimatedCost * 0.82) - waybill.weight * 15), description: '其他预估费用' },
            ] : [])
            const cargoInfo = cargoCategories.find((c) => c.id === waybill.cargoType)
            const totalAmount = items.reduce((s, i) => s + i.amount, 0)
            const statusMap: Record<string, { label: string; color: string }> = {
              pending: { label: '待审核', color: 'bg-gray-100 text-gray-600' },
              approved: { label: '已审核', color: 'bg-yellow-100 text-yellow-700' },
              in_transit: { label: '在途', color: 'bg-blue-100 text-blue-700' },
              arrived: { label: '已到站', color: 'bg-emerald-100 text-emerald-700' },
            }
            return (
              <div key={waybill.id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-rail-600">{waybill.id}</span>
                      <span className={`status-badge ${statusMap[waybill.status]?.color || 'bg-gray-100'}`}>
                        {statusMap[waybill.status]?.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {cargoInfo?.icon} {cargoInfo?.name} · {waybill.originStation} → {waybill.destinationStation}
                      </span>
                      <span className="text-[10px] text-gray-400">提交时间 {waybill.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-800">
                        合计：¥{totalAmount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleQuickInvoice(waybill, totalAmount)}
                        className="btn-copper text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Receipt size={12} /> 申请开票
                      </button>
                    </div>
                  </div>
                {items.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 pb-2 w-32">费用类别</th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-2">说明</th>
                        <th className="text-right text-xs font-medium text-gray-500 pb-2 w-28">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 text-sm text-gray-700">
                            <Package size={12} className="inline mr-1.5 text-rail-400" />
                            {item.category}
                          </td>
                          <td className="py-2 text-xs text-gray-500">{item.description}</td>
                          <td className="py-2 text-sm text-gray-800 font-medium text-right">¥{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">暂无费用明细</p>
                )}
              </div>
            )
          }) : (
            <div className="card p-12 text-center text-gray-400">
              <FileText size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无符合条件的费用明细</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reconcile' && (
        <div className="space-y-3">
          {reconciliations.map((recon) => (
            <div key={recon.id} className="card overflow-hidden">
              <button
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedRecon(expandedRecon === recon.id ? null : recon.id)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-medium text-gray-800">{recon.period}</span>
                  <span className="text-xs text-gray-500">{recon.waybillCount} 笔运单</span>
                  <span className={`status-badge ${recon.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {recon.status === 'confirmed' ? '已确认' : '待确认'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-800">¥{recon.totalAmount.toLocaleString()}</span>
                  {expandedRecon === recon.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>
              {expandedRecon === recon.id && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="pt-4 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">对账单号</span>
                        <span className="font-medium">{recon.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">对账期间</span>
                        <span className="font-medium">{recon.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">运单笔数</span>
                        <span className="font-medium">{recon.waybillCount} 笔</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">对账金额</span>
                        <span className="font-semibold text-copper-600">¥{recon.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">生成日期</span>
                        <span>{recon.createdAt}</span>
                      </div>
                      {recon.confirmedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">确认日期</span>
                          <span>{recon.confirmedAt}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {recon.status === 'pending' ? (
                        <button
                          onClick={() => confirmReconciliation(recon.id)}
                          className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                          <CheckCheck size={16} /> 确认对账
                        </button>
                      ) : (
                        <button
                          onClick={() => downloadReconciliation(recon)}
                          className="btn-copper flex-1 flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> 下载对账单
                        </button>
                      )}
                      {recon.status === 'confirmed' && (
                        <button className="btn-secondary flex-1 py-2.5 px-4 flex items-center justify-center gap-2 border-copper-300 text-copper-600 hover:bg-copper-50">
                          <FileBadge2 size={16} /> 查看明细
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'invoice' && (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2 card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">申请发票</h3>
            {invoiceWaybillId && (
              <div className="mb-4 p-3 bg-copper-50 border border-copper-200 rounded-lg text-xs text-copper-700">
                <span className="font-medium">已选择运单：</span> {invoiceWaybillId}
                <button
                  onClick={() => setInvoiceWaybillId('')}
                  className="ml-2 text-copper-500 hover:text-copper-700 underline"
                >
                  取消选择
                </button>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="label-text">开票抬头</label>
                <input
                  type="text"
                  className="input-field"
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  placeholder="请输入开票抬头"
                />
              </div>
              <div>
                <label className="label-text">发票类型</label>
                <select className="input-field" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)}>
                  <option>增值税专用发票</option>
                  <option>增值税普通发票</option>
                </select>
              </div>
              <div>
                <label className="label-text">开票金额（元）</label>
                <input
                  type="number"
                  className="input-field"
                  value={invoiceAmount || ''}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  placeholder="请输入金额"
                />
              </div>
              <button onClick={handleApplyInvoice} disabled={!invoiceTitle || !invoiceAmount} className="btn-primary w-full">
                提交申请
              </button>
            </div>
          </div>

          <div className="col-span-3 card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">申请记录 / 开票进度</h3>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((inv) => {
                  const info = invoiceStatusMap[inv.status]
                  return (
                    <div key={inv.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-sm font-medium text-rail-600">{inv.id}</span>
                          <span className="text-xs text-gray-500 ml-2">{inv.type}</span>
                          {inv.invoiceNo && <span className="text-xs text-gray-400 ml-2">票号: {inv.invoiceNo}</span>}
                        </div>
                        <span className={`status-badge ${info.color}`}>{info.label}</span>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">
                          抬头：{inv.title} <span className="text-copper-600 font-semibold ml-3">¥{inv.amount.toLocaleString()}</span>
                        </p>
                        <p className="text-[10px] text-gray-400">
                          申请 {inv.createdAt}
                          {inv.approvedAt && ` · 审核 ${inv.approvedAt}`}
                          {inv.issuedAt && ` · 开票 ${inv.issuedAt}`}
                        </p>
                      </div>
                      <div className="mb-3">
                        <div className="relative">
                          <div className="flex justify-between px-2 mb-1.5">
                            {invoiceSteps.map((label, idx) => (
                              <span
                                key={label}
                                className={cn(
                                  'text-[10px] font-medium',
                                  idx <= info.step ? 'text-rail-600' : 'text-gray-400'
                                )}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rail-500 rounded-full transition-all duration-500"
                              style={{ width: `${(info.step / (invoiceSteps.length - 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {inv.status === 'pending' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'approved')}
                            className="btn-secondary text-xs py-1.5 px-3 flex-1"
                          >
                            模拟：通过审核
                          </button>
                        )}
                        {inv.status === 'approved' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'issued')}
                            className="btn-copper text-xs py-1.5 px-3 flex-1"
                          >
                            模拟：完成开票
                          </button>
                        )}
                        {inv.status === 'issued' && (
                          <button
                            onClick={() => downloadInvoiceFile(inv)}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center justify-center gap-1 flex-1"
                          >
                            <Download size={12} /> 下载电子发票
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Receipt size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无发票申请记录</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
