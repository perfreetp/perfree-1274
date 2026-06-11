import { Link } from 'react-router-dom'
import {
  FileText,
  MapPin,
  Calculator,
  CalendarClock,
  TrendingUp,
  Truck,
  AlertTriangle,
  Clock,
  Bell,
  ArrowRight,
} from 'lucide-react'
import { useStore } from '@/store'
import { cargoCategories } from '@/data/mockData'

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
  rejected: { label: '已驳回', color: 'bg-red-100 text-red-700' },
  in_transit: { label: '在途', color: 'bg-blue-100 text-blue-700' },
  arrived: { label: '已到站', color: 'bg-emerald-100 text-emerald-700' },
}

export default function Home() {
  const waybills = useStore((s) => s.waybills)
  const notifications = useStore((s) => s.notifications)
  const exceptions = useStore((s) => s.exceptions)

  const monthlyShipment = waybills.length
  const inTransitCount = waybills.filter((w) => w.status === 'in_transit').length
  const pendingSettlement = waybills
    .filter((w) => w.status === 'arrived' || w.status === 'in_transit')
    .reduce((sum, w) => sum + w.estimatedCost, 0)
  const exceptionCount = exceptions.filter((e) => e.status !== 'resolved').length

  const quickLinks = [
    { label: '创建运单', icon: FileText, path: '/waybill/create', color: 'from-rail-500 to-rail-600' },
    { label: '货物跟踪', icon: MapPin, path: '/tracking', color: 'from-blue-500 to-blue-600' },
    { label: '费用试算', icon: Calculator, path: '/cost', color: 'from-copper-500 to-copper-600' },
    { label: '装卸预约', icon: CalendarClock, path: '/loading', color: 'from-emerald-500 to-emerald-600' },
  ]

  const stats = [
    { label: '本月发运量', value: monthlyShipment, unit: '单', icon: TrendingUp, gradient: 'from-rail-500 to-rail-400' },
    { label: '在途运单', value: inTransitCount, unit: '单', icon: Truck, gradient: 'from-blue-500 to-blue-400' },
    { label: '待结算金额', value: `¥${(pendingSettlement / 10000).toFixed(1)}`, unit: '万', icon: Calculator, gradient: 'from-copper-500 to-copper-400' },
    { label: '异常待处理', value: exceptionCount, unit: '件', icon: AlertTriangle, gradient: 'from-orange-500 to-orange-400' },
  ]

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="grid grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="card p-5 relative overflow-hidden group hover:shadow-md transition-shadow duration-200"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-full`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                    <span className="text-sm text-gray-400">{stat.unit}</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-4 gap-5">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`card p-5 flex flex-col items-center gap-3 group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                <Icon size={24} />
              </div>
              <span className="text-sm font-medium text-gray-700">{link.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">近期运单</h3>
            <Link to="/tracking" className="text-sm text-rail-500 hover:text-rail-600 flex items-center gap-1">
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">运单号</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">货类</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">发站</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">到站</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">状态</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">金额</th>
                </tr>
              </thead>
              <tbody>
                {waybills.slice(0, 5).map((waybill) => {
                  const cargo = cargoCategories.find((c) => c.id === waybill.cargoType)
                  const status = statusMap[waybill.status]
                  return (
                    <tr key={waybill.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="py-3 text-sm text-rail-500 font-medium">{waybill.id}</td>
                      <td className="py-3 text-sm text-gray-700">{cargo?.icon} {cargo?.name}</td>
                      <td className="py-3 text-sm text-gray-600">{waybill.originStation}</td>
                      <td className="py-3 text-sm text-gray-600">{waybill.destinationStation}</td>
                      <td className="py-3">
                        <span className={`status-badge ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="py-3 text-sm text-gray-800 font-medium text-right">¥{waybill.estimatedCost.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Bell size={16} className="text-copper-500" />
              通知公告
            </h3>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => {
              const typeColors: Record<string, string> = {
                system: 'bg-blue-500',
                rate: 'bg-copper-500',
                route: 'bg-yellow-500',
                arrival: 'bg-green-500',
                warning: 'bg-red-500',
              }
              return (
                <div
                  key={notification.id}
                  className={`flex gap-3 p-3 rounded-lg transition-colors duration-200 cursor-pointer ${
                    notification.read ? 'bg-gray-50/50' : 'bg-rail-50'
                  } hover:bg-gray-100/80`}
                >
                  <div className={`w-1.5 rounded-full flex-shrink-0 ${typeColors[notification.type] || 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-medium ${notification.read ? 'text-gray-500' : 'text-rail-600'}`}>
                        {notification.title}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                        <Clock size={10} className="inline mr-0.5" />
                        {notification.time.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{notification.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
