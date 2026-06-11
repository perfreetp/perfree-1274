import { useState } from 'react'
import {
  Search,
  Check,
  Download,
  ChevronRight,
  Package,
  Truck,
  ClipboardCheck,
  FileCheck,
} from 'lucide-react'
import { useStore } from '@/store'
import { cargoCategories, stations, vehicleTypes } from '@/data/mockData'
import { cn } from '@/lib/utils'
import type { Waybill } from '@/types'

const statusSteps = [
  { key: 'draft', label: '填写运单', icon: Package },
  { key: 'pending', label: '提报审核', icon: ClipboardCheck },
  { key: 'approved', label: '审核通过', icon: FileCheck },
  { key: 'in_transit', label: '发运在途', icon: Truck },
]

const stepOrder = ['draft', 'pending', 'approved', 'rejected', 'in_transit', 'arrived']

export default function WaybillCreate() {
  const addWaybill = useStore((s) => s.addWaybill)
  const [selectedCargo, setSelectedCargo] = useState<string>('')
  const [originQuery, setOriginQuery] = useState('')
  const [destQuery, setDestQuery] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState('')
  const [selectedDest, setSelectedDest] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [vehicleCount, setVehicleCount] = useState(1)
  const [weight, setWeight] = useState(0)
  const [shipper, setShipper] = useState('')
  const [consignee, setConsignee] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [createdWaybill, setCreatedWaybill] = useState<Waybill | null>(null)

  const cargo = cargoCategories.find((c) => c.id === selectedCargo)
  const vehicle = vehicleTypes.find((v) => v.id === selectedVehicle)

  const filteredOriginStations = stations.filter(
    (s) =>
      originQuery.length > 0 &&
      (s.name.includes(originQuery) || s.code.toLowerCase().includes(originQuery.toLowerCase()))
  )
  const filteredDestStations = stations.filter(
    (s) =>
      destQuery.length > 0 &&
      (s.name.includes(destQuery) || s.code.toLowerCase().includes(destQuery.toLowerCase()))
  )

  const calculateCost = () => {
    if (!cargo || !vehicle || !weight) return 0
    const distance = 1200
    const baseCost = weight * cargo.rate * distance
    const vehicleCost = vehicleCount * vehicle.rate * 500
    const loadingCost = weight * 15
    const otherCost = vehicleCount * 200
    return Math.round(baseCost + vehicleCost + loadingCost + otherCost)
  }

  const estimatedCost = calculateCost()

  const handleSubmit = () => {
    if (!selectedCargo || !selectedOrigin || !selectedDest || !selectedVehicle || !weight) return
    const waybill: Waybill = {
      id: `YD202606${String(Math.floor(Math.random() * 9000) + 1000)}`,
      cargoType: selectedCargo,
      originStation: selectedOrigin,
      destinationStation: selectedDest,
      vehicleType: selectedVehicle,
      vehicleCount,
      weight,
      status: 'pending',
      estimatedCost,
      createdAt: new Date().toLocaleString('zh-CN'),
      shipper,
      consignee,
    }
    addWaybill(waybill)
    setCreatedWaybill(waybill)
    setSubmitted(true)
  }

  const currentStepIndex = createdWaybill
    ? stepOrder.indexOf(createdWaybill.status)
    : -1

  if (submitted && createdWaybill) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">提报审核进度</h3>
          <div className="flex items-center justify-between mb-8">
            {statusSteps.map((step, idx) => {
              const Icon = step.icon
              const isCompleted = currentStepIndex > stepOrder.indexOf(step.key)
              const isCurrent = createdWaybill.status === step.key || (createdWaybill.status === 'rejected' && step.key === 'pending')
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                        isCompleted ? 'bg-green-500 border-green-500 text-white' :
                        isCurrent ? 'bg-rail-500 border-rail-500 text-white' :
                        'bg-gray-50 border-gray-200 text-gray-400'
                      )}
                    >
                      {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={cn('text-xs mt-2', isCurrent ? 'text-rail-600 font-medium' : 'text-gray-500')}>
                      {step.label}
                    </span>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-2 mt-[-20px]', isCompleted ? 'bg-green-500' : 'bg-gray-200')} />
                  )}
                </div>
              )
            })}
          </div>
          {createdWaybill.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
              运单已提交，等待审核。审核结果将以站内通知形式告知。
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">电子运单</h3>
            <button className="btn-secondary text-sm flex items-center gap-1.5 py-2">
              <Download size={14} /> 下载运单
            </button>
          </div>
          <div className="bg-rail-50 border border-rail-100 rounded-lg p-5 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">运单号：</span><span className="font-medium text-rail-600">{createdWaybill.id}</span></div>
              <div><span className="text-gray-500">货类：</span><span className="font-medium">{cargoCategories.find((c) => c.id === createdWaybill.cargoType)?.name}</span></div>
              <div><span className="text-gray-500">发站：</span><span className="font-medium">{createdWaybill.originStation}</span></div>
              <div><span className="text-gray-500">到站：</span><span className="font-medium">{createdWaybill.destinationStation}</span></div>
              <div><span className="text-gray-500">车型：</span><span className="font-medium">{vehicleTypes.find((v) => v.id === createdWaybill.vehicleType)?.name}</span></div>
              <div><span className="text-gray-500">车数：</span><span className="font-medium">{createdWaybill.vehicleCount} 车</span></div>
              <div><span className="text-gray-500">重量：</span><span className="font-medium">{createdWaybill.weight} 吨</span></div>
              <div><span className="text-gray-500">预估费用：</span><span className="font-semibold text-copper-600">¥{createdWaybill.estimatedCost.toLocaleString()}</span></div>
              <div><span className="text-gray-500">发货人：</span><span className="font-medium">{createdWaybill.shipper || '-'}</span></div>
              <div><span className="text-gray-500">收货人：</span><span className="font-medium">{createdWaybill.consignee || '-'}</span></div>
            </div>
          </div>
        </div>

        <button onClick={() => { setSubmitted(false); setCreatedWaybill(null) }} className="btn-primary">
          创建新运单
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">选择货类</h3>
            <div className="flex flex-wrap gap-3">
              {cargoCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCargo(cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 hover:shadow-sm',
                    selectedCargo === cat.id
                      ? 'border-copper-500 bg-copper-50 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  )}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className={cn('text-sm font-medium', selectedCargo === cat.id ? 'text-copper-700' : 'text-gray-700')}>
                    {cat.name}
                  </span>
                  {selectedCargo === cat.id && <Check size={16} className="text-copper-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">到发站查询</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="label-text">发站</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="input-field pl-9"
                    placeholder="搜索站名或站码"
                    value={selectedOrigin || originQuery}
                    onChange={(e) => { setOriginQuery(e.target.value); setSelectedOrigin('') }}
                  />
                </div>
                {filteredOriginStations.length > 0 && !selectedOrigin && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto">
                    {filteredOriginStations.map((s) => (
                      <button
                        key={s.code}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-rail-50 flex items-center justify-between"
                        onClick={() => { setSelectedOrigin(s.name); setOriginQuery('') }}
                      >
                        <span>{s.name}</span>
                        <span className="text-xs text-gray-400">{s.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <label className="label-text">到站</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="input-field pl-9"
                    placeholder="搜索站名或站码"
                    value={selectedDest || destQuery}
                    onChange={(e) => { setDestQuery(e.target.value); setSelectedDest('') }}
                  />
                </div>
                {filteredDestStations.length > 0 && !selectedDest && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto">
                    {filteredDestStations.map((s) => (
                      <button
                        key={s.code}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-rail-50 flex items-center justify-between"
                        onClick={() => { setSelectedDest(s.name); setDestQuery('') }}
                      >
                        <span>{s.name}</span>
                        <span className="text-xs text-gray-400">{s.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">车辆需求</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label-text">车型</label>
                <select
                  className="input-field"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                >
                  <option value="">请选择车型</option>
                  {vehicleTypes.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}（载重{v.capacity}吨）</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">车数</label>
                <input
                  type="number"
                  className="input-field"
                  min={1}
                  max={50}
                  value={vehicleCount}
                  onChange={(e) => setVehicleCount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label-text">总重量（吨）</label>
                <input
                  type="number"
                  className="input-field"
                  min={1}
                  max={3000}
                  value={weight || ''}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  placeholder="请输入重量"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label-text">发货人</label>
                <input
                  type="text"
                  className="input-field"
                  value={shipper}
                  onChange={(e) => setShipper(e.target.value)}
                  placeholder="发货人名称"
                />
              </div>
              <div>
                <label className="label-text">收货人</label>
                <input
                  type="text"
                  className="input-field"
                  value={consignee}
                  onChange={(e) => setConsignee(e.target.value)}
                  placeholder="收货人名称"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedCargo || !selectedOrigin || !selectedDest || !selectedVehicle || !weight}
            className="btn-primary flex items-center gap-2"
          >
            提交运单 <ChevronRight size={16} />
          </button>
        </div>

        <div className="w-72 flex-shrink-0">
          <div className="card p-5 sticky top-0">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-copper-500 rounded-full" />
              运价试算
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">货类</span>
                <span className="font-medium">{cargo?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">发站</span>
                <span className="font-medium">{selectedOrigin || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">到站</span>
                <span className="font-medium">{selectedDest || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">车型</span>
                <span className="font-medium">{vehicle?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">车数</span>
                <span className="font-medium">{vehicleCount} 车</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">重量</span>
                <span className="font-medium">{weight || 0} 吨</span>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">基本运费</span>
                  <span>¥{weight && cargo ? Math.round(weight * cargo.rate * 1200).toLocaleString() : '0'}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">装卸费</span>
                  <span>¥{weight ? Math.round(weight * 15).toLocaleString() : '0'}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">其他费用</span>
                  <span>¥{vehicleCount ? (vehicleCount * (vehicle?.rate || 1) * 500 + vehicleCount * 200).toLocaleString() : '0'}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-700 font-medium">预估总额</span>
                  <span className="text-xl font-bold text-copper-600">¥{estimatedCost.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">*实际费用以审核结果为准</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
