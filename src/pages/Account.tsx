import { useState } from 'react'
import {
  UserCircle,
  Building2,
  Phone,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '@/store'
import { cargoCategories } from '@/data/mockData'
import { cn } from '@/lib/utils'
import type { Contact } from '@/types'

type TabKey = 'contacts' | 'approval'

export default function Account() {
  const [activeTab, setActiveTab] = useState<TabKey>('contacts')
  const contacts = useStore((s) => s.contacts)
  const waybills = useStore((s) => s.waybills)
  const addContact = useStore((s) => s.addContact)
  const updateContact = useStore((s) => s.updateContact)
  const deleteContact = useStore((s) => s.deleteContact)

  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formName, setFormName] = useState('')
  const [formCompany, setFormCompany] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formType, setFormType] = useState<Contact['type']>('shipper')

  const tabs: { key: TabKey; label: string; icon: typeof UserCircle }[] = [
    { key: 'contacts', label: '常用收发货人', icon: UserCircle },
    { key: 'approval', label: '提报审核状态', icon: ClipboardCheck },
  ]

  const shippers = contacts.filter((c) => c.type === 'shipper')
  const consignees = contacts.filter((c) => c.type === 'consignee')

  const approvalWaybills = waybills.filter((w) => ['pending', 'approved', 'rejected'].includes(w.status))

  const resetForm = () => {
    setShowForm(false)
    setEditingContact(null)
    setFormName('')
    setFormCompany('')
    setFormPhone('')
    setFormAddress('')
    setFormType('shipper')
  }

  const openEditForm = (contact: Contact) => {
    setEditingContact(contact)
    setFormName(contact.name)
    setFormCompany(contact.company)
    setFormPhone(contact.phone)
    setFormAddress(contact.address)
    setFormType(contact.type)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formName || !formCompany || !formPhone) return
    if (editingContact) {
      updateContact({
        ...editingContact,
        name: formName,
        company: formCompany,
        phone: formPhone,
        address: formAddress,
        type: formType,
      })
    } else {
      const contact: Contact = {
        id: `ct${Date.now()}`,
        name: formName,
        company: formCompany,
        phone: formPhone,
        address: formAddress,
        type: formType,
      }
      addContact(contact)
    }
    resetForm()
  }

  const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { label: '已通过', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { label: '已驳回', color: 'bg-red-100 text-red-700', icon: XCircle },
  }

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <div className="card p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            contact.type === 'shipper' ? 'bg-rail-50 text-rail-500' : 'bg-copper-50 text-copper-500'
          )}>
            <Building2 size={18} />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">{contact.name}</span>
            <span className={cn(
              'status-badge ml-2 text-[10px]',
              contact.type === 'shipper' ? 'bg-rail-50 text-rail-600' : 'bg-copper-50 text-copper-600'
            )}>
              {contact.type === 'shipper' ? '发货人' : '收货人'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditForm(contact)}
            className="p-1.5 rounded-md text-gray-400 hover:text-rail-500 hover:bg-rail-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteContact(contact.id)}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="space-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Building2 size={12} />
          <span>{contact.company}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={12} />
          <span>{contact.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={12} />
          <span className="truncate">{contact.address}</span>
        </div>
      </div>
    </div>
  )

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

      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">常用发货人</h3>
              <button
                onClick={() => { resetForm(); setShowForm(true) }}
                className="btn-copper text-sm flex items-center gap-1.5 py-2"
              >
                <Plus size={14} /> 新增发货人
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {shippers.map((c) => (
                <ContactCard key={c.id} contact={c} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">常用收货人</h3>
              <button
                onClick={() => { resetForm(); setFormType('consignee'); setShowForm(true) }}
                className="btn-copper text-sm flex items-center gap-1.5 py-2"
              >
                <Plus size={14} /> 新增收货人
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {consignees.map((c) => (
                <ContactCard key={c.id} contact={c} />
              ))}
            </div>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-800">
                    {editingContact ? '编辑联系人' : '新增联系人'}
                  </h3>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label-text">类型</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormType('shipper')}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-sm border-2 transition-all',
                          formType === 'shipper'
                            ? 'border-rail-500 bg-rail-50 text-rail-600 font-medium'
                            : 'border-gray-200 text-gray-600'
                        )}
                      >
                        发货人
                      </button>
                      <button
                        onClick={() => setFormType('consignee')}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-sm border-2 transition-all',
                          formType === 'consignee'
                            ? 'border-copper-500 bg-copper-50 text-copper-600 font-medium'
                            : 'border-gray-200 text-gray-600'
                        )}
                      >
                        收货人
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label-text">姓名</label>
                    <input type="text" className="input-field" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="请输入姓名" />
                  </div>
                  <div>
                    <label className="label-text">公司</label>
                    <input type="text" className="input-field" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} placeholder="请输入公司名称" />
                  </div>
                  <div>
                    <label className="label-text">电话</label>
                    <input type="text" className="input-field" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="请输入电话" />
                  </div>
                  <div>
                    <label className="label-text">地址</label>
                    <input type="text" className="input-field" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="请输入地址" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={resetForm} className="btn-secondary flex-1">取消</button>
                    <button onClick={handleSave} disabled={!formName || !formCompany || !formPhone} className="btn-primary flex-1 flex items-center justify-center gap-1">
                      <Check size={16} /> 保存
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'approval' && (
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">提报审核状态</h3>
          {approvalWaybills.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">运单号</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">货类</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">发站</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3">到站</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">金额</th>
                  <th className="text-center text-xs font-medium text-gray-500 pb-3">审核状态</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">提交时间</th>
                </tr>
              </thead>
              <tbody>
                {approvalWaybills.map((waybill) => {
                  const cargo = cargoCategories.find((c) => c.id === waybill.cargoType)
                  const status = statusMap[waybill.status]
                  const StatusIcon = status.icon
                  return (
                    <tr key={waybill.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="py-3 text-sm text-rail-500 font-medium">{waybill.id}</td>
                      <td className="py-3 text-sm text-gray-700">{cargo?.icon} {cargo?.name}</td>
                      <td className="py-3 text-sm text-gray-600">{waybill.originStation}</td>
                      <td className="py-3 text-sm text-gray-600">{waybill.destinationStation}</td>
                      <td className="py-3 text-sm text-gray-800 font-medium text-right">¥{waybill.estimatedCost.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <span className={`status-badge ${status.color} gap-1`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-400 text-right">{waybill.createdAt}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <ClipboardCheck size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无审核中的运单</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
