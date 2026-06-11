import { useState } from 'react'
import {
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Navigation,
  Bell,
} from 'lucide-react'
import { useStore } from '@/store'
import { mockTrackingNodes, cargoCategories } from '@/data/mockData'
import { cn } from '@/lib/utils'

export default function Tracking() {
  const waybills = useStore((s) => s.waybills)
  const [selectedWaybill, setSelectedWaybill] = useState<string>(waybills[0]?.id || '')
  const notifications = useStore((s) => s.notifications)

  const trackableWaybills = waybills.filter(
    (w) => w.status === 'in_transit' || w.status === 'arrived' || w.status === 'approved' || w.status === 'pending'
  )
  const currentWaybill = waybills.find((w) => w.id === selectedWaybill)
  const trackingNodes = mockTrackingNodes[selectedWaybill] || []
  const arrivalNotifications = notifications.filter((n) => n.type === 'arrival')
  const warningNotifications = notifications.filter((n) => n.type === 'warning')

  const statusMap: Record<string, { label: string; color: string }> = {
    in_transit: { label: '在途', color: 'bg-blue-100 text-blue-700' },
    arrived: { label: '已到站', color: 'bg-emerald-100 text-emerald-700' },
    approved: { label: '待发运', color: 'bg-yellow-100 text-yellow-700' },
    pending: { label: '待审核', color: 'bg-gray-100 text-gray-600' },
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {(arrivalNotifications.length > 0 || warningNotifications.length > 0) && (
        <div className="space-y-2">
          {arrivalNotifications.map((n) => (
            <div key={n.id} className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <Bell size={16} className="text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-700">{n.content}</span>
              <span className="text-xs text-green-500 ml-auto flex-shrink-0">{n.time}</span>
            </div>
          ))}
          {warningNotifications.map((n) => (
            <div key={n.id} className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{n.content}</span>
              <span className="text-xs text-red-500 ml-auto flex-shrink-0">{n.time}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">运单列表</h3>
          <div className="space-y-2">
            {trackableWaybills.map((waybill) => {
              const cargo = cargoCategories.find((c) => c.id === waybill.cargoType)
              const status = statusMap[waybill.status]
              const hasWarning = warningNotifications.some((n) => n.content.includes(waybill.id))
              return (
                <button
                  key={waybill.id}
                  onClick={() => setSelectedWaybill(waybill.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all duration-200',
                    selectedWaybill === waybill.id
                      ? 'border-rail-300 bg-rail-50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-rail-600">{waybill.id}</span>
                    <span className={`status-badge text-[10px] ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>{cargo?.icon}</span>
                    <span>{waybill.originStation}</span>
                    <Navigation size={10} />
                    <span>{waybill.destinationStation}</span>
                  </div>
                  {hasWarning && (
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                      <AlertTriangle size={12} /> 滞留预警
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="col-span-2 space-y-5">
          {currentWaybill && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    运单 {currentWaybill.id} 在途追踪
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {cargoCategories.find((c) => c.id === currentWaybill.cargoType)?.name} · {currentWaybill.weight}吨 · {currentWaybill.vehicleCount}车
                  </p>
                </div>
                <span className={`status-badge ${statusMap[currentWaybill.status]?.color}`}>
                  {statusMap[currentWaybill.status]?.label}
                </span>
              </div>

              {trackingNodes.length > 0 ? (
                <div className="relative pl-8">
                  {trackingNodes.map((node, idx) => {
                    const isLast = idx === trackingNodes.length - 1
                    return (
                      <div key={node.id} className="relative pb-8 last:pb-0">
                        {!isLast && (
                          <div
                            className={cn(
                              'absolute left-[-20px] top-6 w-0.5 h-full',
                              node.status === 'passed' ? 'bg-green-300' : 'bg-gray-200'
                            )}
                          />
                        )}
                        <div
                          className={cn(
                            'absolute left-[-24px] top-1 w-3 h-3 rounded-full border-2',
                            node.status === 'passed'
                              ? 'bg-green-500 border-green-500'
                              : node.status === 'current'
                              ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-100'
                              : 'bg-white border-gray-300'
                          )}
                        />
                        <div className={cn(
                          'p-4 rounded-lg border',
                          node.status === 'current' ? 'bg-blue-50 border-blue-200' :
                          node.status === 'passed' ? 'bg-green-50/50 border-green-100' :
                          'bg-gray-50/50 border-gray-100'
                        )}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {node.status === 'passed' ? (
                                <CheckCircle2 size={16} className="text-green-500" />
                              ) : node.status === 'current' ? (
                                <Navigation size={16} className="text-blue-500" />
                              ) : (
                                <Circle size={16} className="text-gray-300" />
                              )}
                              <span className={cn(
                                'text-sm font-medium',
                                node.status === 'current' ? 'text-blue-700' :
                                node.status === 'passed' ? 'text-green-700' : 'text-gray-500'
                              )}>
                                {node.station}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={12} />
                              {node.time}
                            </span>
                          </div>
                          <p className={cn(
                            'text-xs ml-6',
                            node.status === 'current' ? 'text-blue-600' :
                            node.status === 'passed' ? 'text-green-600' : 'text-gray-400'
                          )}>
                            {node.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <MapPin size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">暂无追踪信息</p>
                  <p className="text-xs mt-1">运单审核通过后将显示在途追踪节点</p>
                </div>
              )}
            </div>
          )}

          {currentWaybill && warningNotifications.some((n) => n.content.includes(currentWaybill.id)) && (
            <div className="card p-5 border-red-200 bg-red-50/30">
              <h3 className="text-base font-semibold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} /> 滞留预警
              </h3>
              {warningNotifications
                .filter((n) => n.content.includes(currentWaybill.id))
                .map((n) => (
                  <div key={n.id} className="bg-white border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{n.content}</p>
                    <p className="text-xs text-red-500 mt-2">{n.time}</p>
                    <div className="mt-3 flex gap-2">
                      <button className="btn-copper text-xs py-1.5 px-3">联系客服</button>
                      <button className="btn-secondary text-xs py-1.5 px-3 border-red-300 text-red-600 hover:bg-red-50">
                        查看详情
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
