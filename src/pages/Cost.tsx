import { useState } from 'react'
import {
  Calculator,
  FileText,
  Receipt,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react'
import { useStore } from '@/store'
import { cargoCategories, stations, mockCostItems } from '@/data/mockData'
import { cn } from '@/lib/utils'
import type { InvoiceApplication } from '@/types'

type TabKey = 'calculate' | 'detail' | 'reconcile' | 'invoice'

export default function Cost() {
  const [activeTab, setActiveTab] = useState<TabKey>('calculate')
  const waybills = useStore((s) => s.waybills)
  const reconciliations = useStore((s) => s.reconciliations)
  const invoices = useStore((s) => s.invoices)
  const addInvoice = useStore((s) => s.addInvoice)
  const confirmReconciliation = useStore((s) => s.confirmReconciliation)

  const [calcCargo, setCalcCargo] = useState('')
  const [calcOrigin, setCalcOrigin] = useState('')
  const [calcDest, setCalcDest] = useState('')
  const [calcWeight, setCalcWeight] = useState(0)
  const [expandedRecon, setExpandedRecon] = useState<string | null>(null)
  const [invoiceTitle, setInvoiceTitle] = useState('')
  const [invoiceType, setInvoiceType] = useState('增值税专用发票')
  const [invoiceAmount, setInvoiceAmount] = useState(0)

  const tabs: { key: TabKey; label: string; icon: typeof Calculator }[] = [
    { key: 'calculate', label: '运价计算', icon: Calculator },
    { key: 'detail', label: '费用明细', icon: FileText },
    { key: 'reconcile', label: '电子对账', icon: CheckCircle2 },
    { key: 'invoice', label: '发票申请', icon: Receipt },
  ]

  const cargo = cargoCategories.find((c) => c.id === calcCargo)
  const calcDistance = 1200
  const baseCost = calcWeight && cargo ? Math.round(calcWeight * cargo.rate * calcDistance) : 0
  const loadingCost = calcWeight ? Math.round(calcWeight * 15) : 0
  const otherCost = calcWeight ? Math.round(calcWeight * 2.5) : 0
  const totalCost = baseCost + loadingCost + otherCost

  const settledWaybills = waybills.filter((w) => w.status === 'arrived')

  const handleApplyInvoice = () => {
    if (!invoiceTitle || !invoiceAmount) return
    const invoice: InvoiceApplication = {
      id: `INV${Date.now()}`,
      amount: invoiceAmount,
      title: invoiceTitle,
      type: invoiceType,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('zh-CN'),
    }
    addInvoice(invoice)
    setInvoiceTitle('')
    setInvoiceAmount(0)
  }

  const invoiceStatusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: '已审核', color: 'bg-blue-100 text-blue-700' },
    issued: { label: '已开票', color: 'bg-green-100 text-green-700' },
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex gap-2 border-b border-gray-100 pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
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
          </div>

          <div className="col-span-2 card p-6 h-fit sticky top-0">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-copper-500 rounded-full" />
              试算结果
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">基本运费</span>
                <span>¥{baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">装卸费</span>
                <span>¥{loadingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">其他费用</span>
                <span>¥{otherCost.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
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

      {activeTab === 'detail' && (
        <div className="space-y-4">
          {settledWaybills.length > 0 ? settledWaybills.map((waybill) => {
            const items = mockCostItems[waybill.id] || []
            const cargoInfo = cargoCategories.find((c) => c.id === waybill.cargoType)
            return (
              <div key={waybill.id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm font-medium text-rail-600">{waybill.id}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {cargoInfo?.icon} {cargoInfo?.name} · {waybill.originStation} → {waybill.destinationStation}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    合计：¥{items.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                  </span>
                </div>
                {items.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 pb-2">费用类别</th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-2">说明</th>
                        <th className="text-right text-xs font-medium text-gray-500 pb-2">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 text-sm text-gray-700">{item.category}</td>
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
              <p className="text-sm">暂无已结算运单</p>
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
                <div className="flex items-center gap-4">
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
                    </div>
                    {recon.status === 'pending' && (
                      <button
                        onClick={() => confirmReconciliation(recon.id)}
                        className="btn-primary w-full"
                      >
                        确认对账
                      </button>
                    )}
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
            <h3 className="text-base font-semibold text-gray-800 mb-4">申请记录</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">申请编号</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">开票抬头</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">发票类型</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">金额</th>
                  <th className="text-center text-xs font-medium text-gray-500 pb-3">状态</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-sm text-rail-500 font-medium">{inv.id}</td>
                    <td className="py-3 text-sm text-gray-700">{inv.title}</td>
                    <td className="py-3 text-xs text-gray-500">{inv.type}</td>
                    <td className="py-3 text-sm text-gray-800 font-medium text-right">¥{inv.amount.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <span className={`status-badge ${invoiceStatusMap[inv.status]?.color}`}>
                        {invoiceStatusMap[inv.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
