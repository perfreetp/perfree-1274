import { useState } from 'react'
import {
  CalendarClock,
  Warehouse,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react'
import { useStore } from '@/store'
import { mockWarehouseSlots, cargoCategories } from '@/data/mockData'
import { cn } from '@/lib/utils'
import type { LoadingAppointment } from '@/types'

export default function Loading() {
  const waybills = useStore((s) => s.waybills)
  const loadingAppointments = useStore((s) => s.loadingAppointments)
  const addLoadingAppointment = useStore((s) => s.addLoadingAppointment)

  const [selectedWaybill, setSelectedWaybill] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')

  const approvedWaybills = waybills.filter((w) => w.status === 'approved')
  const currentWaybill = waybills.find((w) => w.id === selectedWaybill)

  const timeSlots = [
    '06:00-08:00',
    '08:00-10:00',
    '10:00-12:00',
    '14:00-16:00',
    '16:00-18:00',
    '18:00-20:00',
  ]

  const methods = ['机械装载', '人力装载', '集装箱吊装']

  const handleBook = () => {
    if (!selectedWaybill || !selectedDate || !selectedTimeSlot || !selectedMethod) return
    const appointment: LoadingAppointment = {
      id: `LA${Date.now()}`,
      waybillId: selectedWaybill,
      station: currentWaybill?.originStation || '',
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      method: selectedMethod,
      status: 'scheduled',
    }
    addLoadingAppointment(appointment)
    setSelectedWaybill('')
    setSelectedDate('')
    setSelectedTimeSlot('')
    setSelectedMethod('')
  }

  const appointmentStatusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    scheduled: { label: '已预约', color: 'bg-blue-100 text-blue-700', icon: Clock },
    completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  }

  const getSlotColor = (available: number, total: number) => {
    const ratio = available / total
    if (ratio > 0.4) return 'bg-green-500'
    if (ratio > 0.2) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getSlotBgColor = (available: number, total: number) => {
    const ratio = available / total
    if (ratio > 0.4) return 'bg-green-50 border-green-200'
    if (ratio > 0.2) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-copper-500" />
            装车预约
          </h3>

          <div className="space-y-4">
            <div>
              <label className="label-text">选择运单</label>
              <select
                className="input-field"
                value={selectedWaybill}
                onChange={(e) => setSelectedWaybill(e.target.value)}
              >
                <option value="">请选择已审核通过的运单</option>
                {approvedWaybills.map((w) => {
                  const cargo = cargoCategories.find((c) => c.id === w.cargoType)
                  return (
                    <option key={w.id} value={w.id}>
                      {w.id} - {cargo?.name} {w.originStation}→{w.destinationStation}
                    </option>
                  )
                })}
              </select>
            </div>

            {currentWaybill && (
              <div className="bg-rail-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">发站</span>
                  <span className="font-medium">{currentWaybill.originStation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">货类</span>
                  <span className="font-medium">{cargoCategories.find((c) => c.id === currentWaybill.cargoType)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">重量</span>
                  <span className="font-medium">{currentWaybill.weight}吨 · {currentWaybill.vehicleCount}车</span>
                </div>
              </div>
            )}

            <div>
              <label className="label-text">预约日期</label>
              <input
                type="date"
                className="input-field"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="label-text">预约时段</label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm border transition-all duration-200',
                      selectedTimeSlot === slot
                        ? 'border-rail-500 bg-rail-50 text-rail-600 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-text">装卸方式</label>
              <div className="flex gap-3">
                {methods.map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={cn(
                      'flex-1 px-3 py-2.5 rounded-lg text-sm border transition-all duration-200',
                      selectedMethod === method
                        ? 'border-copper-500 bg-copper-50 text-copper-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={!selectedWaybill || !selectedDate || !selectedTimeSlot || !selectedMethod}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <CalendarClock size={16} />
              确认预约
            </button>
          </div>
        </div>

        <div className="col-span-2 space-y-5">
          <div className="card p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Warehouse size={18} className="text-copper-500" />
              仓位提示
            </h3>
            <div className="space-y-3">
              {mockWarehouseSlots.map((slot) => (
                <div
                  key={slot.station}
                  className={cn('rounded-lg border p-3', getSlotBgColor(slot.available, slot.total))}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{slot.station}</span>
                    </div>
                    <span className={cn(
                      'text-xs font-medium',
                      slot.available / slot.total > 0.4 ? 'text-green-600' :
                      slot.available / slot.total > 0.2 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      可用 {slot.available}/{slot.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', getSlotColor(slot.available, slot.total))}
                      style={{ width: `${(slot.available / slot.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">预约记录</h3>
        {loadingAppointments.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 pb-3">预约编号</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">运单号</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">站点</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">日期</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">时段</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">方式</th>
                <th className="text-center text-xs font-medium text-gray-500 pb-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {loadingAppointments.map((apt) => {
                const status = appointmentStatusMap[apt.status]
                return (
                  <tr key={apt.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-sm text-rail-500 font-medium">{apt.id}</td>
                    <td className="py-3 text-sm text-gray-700">{apt.waybillId}</td>
                    <td className="py-3 text-sm text-gray-600">{apt.station}</td>
                    <td className="py-3 text-sm text-gray-600">{apt.date}</td>
                    <td className="py-3 text-sm text-gray-600">{apt.timeSlot}</td>
                    <td className="py-3 text-sm text-gray-600">{apt.method}</td>
                    <td className="py-3 text-center">
                      <span className={`status-badge ${status.color}`}>{status.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <CalendarClock size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无预约记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
