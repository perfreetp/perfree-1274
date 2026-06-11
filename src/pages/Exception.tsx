import { useState, useRef } from 'react'
import {
  AlertTriangle,
  MessageSquare,
  Send,
  ImagePlus,
  ChevronRight,
  PackageX,
  FileWarning,
  HelpCircle,
} from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { ExceptionCase, ChatMessage } from '@/types'

type TabKey = 'appeal' | 'chat'

export default function Exception() {
  const [activeTab, setActiveTab] = useState<TabKey>('appeal')
  const exceptions = useStore((s) => s.exceptions)
  const chatSessions = useStore((s) => s.chatSessions)
  const addException = useStore((s) => s.addException)
  const sendMessage = useStore((s) => s.sendMessage)
  const [selectedSession, setSelectedSession] = useState(chatSessions[0]?.id || '')

  const [excType, setExcType] = useState<ExceptionCase['type']>('damage')
  const [excWaybillId, setExcWaybillId] = useState('')
  const [excDescription, setExcDescription] = useState('')
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const tabs: { key: TabKey; label: string; icon: typeof AlertTriangle }[] = [
    { key: 'appeal', label: '破损短少申诉', icon: AlertTriangle },
    { key: 'chat', label: '客服会话', icon: MessageSquare },
  ]

  const currentSession = chatSessions.find((s) => s.id === selectedSession)

  const exceptionTypeMap: Record<string, { label: string; icon: typeof PackageX; color: string }> = {
    damage: { label: '破损', icon: PackageX, color: 'text-red-500' },
    shortage: { label: '短少', icon: FileWarning, color: 'text-orange-500' },
    other: { label: '其他', icon: HelpCircle, color: 'text-gray-500' },
  }

  const exceptionStatusMap: Record<string, { label: string; color: string }> = {
    submitted: { label: '已提交', color: 'bg-yellow-100 text-yellow-700' },
    processing: { label: '处理中', color: 'bg-blue-100 text-blue-700' },
    resolved: { label: '已解决', color: 'bg-green-100 text-green-700' },
  }

  const handleAppeal = () => {
    if (!excWaybillId || !excDescription) return
    const exception: ExceptionCase = {
      id: `EX${Date.now()}`,
      waybillId: excWaybillId,
      type: excType,
      description: excDescription,
      status: 'submitted',
      images: [],
      createdAt: new Date().toLocaleString('zh-CN'),
    }
    addException(exception)
    setExcWaybillId('')
    setExcDescription('')
  }

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedSession) return
    const message: ChatMessage = {
      id: `msg${Date.now()}`,
      sender: 'user',
      content: chatInput.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    }
    sendMessage(selectedSession, message)
    setChatInput('')
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `msg${Date.now()}_reply`,
        sender: 'service',
        content: '收到您的消息，正在为您核实处理，请稍候。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      }
      sendMessage(selectedSession, reply)
    }, 1500)
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

      {activeTab === 'appeal' && (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2 card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">提交申诉</h3>
            <div className="space-y-4">
              <div>
                <label className="label-text">异常类型</label>
                <div className="flex gap-2">
                  {Object.entries(exceptionTypeMap).map(([key, val]) => {
                    const Icon = val.icon
                    return (
                      <button
                        key={key}
                        onClick={() => setExcType(key as ExceptionCase['type'])}
                        className={cn(
                          'flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                          excType === key
                            ? 'border-copper-500 bg-copper-50'
                            : 'border-gray-100 hover:border-gray-200'
                        )}
                      >
                        <Icon size={20} className={val.color} />
                        <span className={cn('text-xs font-medium', excType === key ? 'text-copper-700' : 'text-gray-600')}>
                          {val.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="label-text">运单号</label>
                <input
                  type="text"
                  className="input-field"
                  value={excWaybillId}
                  onChange={(e) => setExcWaybillId(e.target.value)}
                  placeholder="请输入运单号"
                />
              </div>
              <div>
                <label className="label-text">问题描述</label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  value={excDescription}
                  onChange={(e) => setExcDescription(e.target.value)}
                  placeholder="请详细描述异常情况"
                />
              </div>
              <div>
                <label className="label-text">上传证据</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-gray-300 transition-colors">
                  <ImagePlus size={24} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-400">点击上传照片</p>
                </div>
              </div>
              <button
                onClick={handleAppeal}
                disabled={!excWaybillId || !excDescription}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                提交申诉 <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="col-span-3 card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">申诉记录</h3>
            {exceptions.length > 0 ? (
              <div className="space-y-3">
                {exceptions.map((exc) => {
                  const typeInfo = exceptionTypeMap[exc.type]
                  const status = exceptionStatusMap[exc.status]
                  return (
                    <div key={exc.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <typeInfo.icon size={16} className={typeInfo.color} />
                          <span className="text-sm font-medium text-gray-800">{exc.id}</span>
                          <span className="text-xs text-gray-500">运单 {exc.waybillId}</span>
                        </div>
                        <span className={`status-badge ${status.color}`}>{status.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{exc.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{exc.createdAt}</span>
                        {exc.reply && (
                          <div className="bg-blue-50 rounded px-3 py-1.5 text-xs text-blue-700 max-w-[70%]">
                            <span className="font-medium">客服回复：</span>{exc.reply}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无申诉记录</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="grid grid-cols-3 gap-0 card overflow-hidden" style={{ height: '600px' }}>
          <div className="border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">会话列表</h3>
            </div>
            <div className="flex-1 overflow-auto">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={cn(
                    'w-full text-left p-4 border-b border-gray-50 transition-colors',
                    selectedSession === session.id ? 'bg-rail-50' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 truncate">{session.title}</span>
                    {session.unread > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
                        {session.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{session.lastMessage}</p>
                  <span className="text-[10px] text-gray-400">{session.lastTime}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 flex flex-col">
            {currentSession ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">{currentSession.title}</h3>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {currentSession.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm',
                          msg.sender === 'user'
                            ? 'bg-rail-500 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        )}
                      >
                        <p>{msg.content}</p>
                        <span className={cn(
                          'text-[10px] mt-1 block',
                          msg.sender === 'user' ? 'text-rail-200' : 'text-gray-400'
                        )}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="输入消息..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      className="btn-primary px-4 flex items-center gap-1"
                    >
                      <Send size={16} />
                      发送
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">选择一个会话开始对话</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
