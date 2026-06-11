import { create } from 'zustand'
import type { Waybill, Contact, ExceptionCase, ChatSession, ChatMessage, Notification, ReconciliationRecord, InvoiceApplication, LoadingAppointment, CostTrial } from '@/types'
import { mockWaybills, mockContacts, mockExceptions, mockChatSessions, mockNotifications, mockReconciliations, mockInvoices, mockLoadingAppointments, mockCostTrials } from '@/data/mockData'

interface AppState {
  waybills: Waybill[]
  contacts: Contact[]
  exceptions: ExceptionCase[]
  chatSessions: ChatSession[]
  notifications: Notification[]
  reconciliations: ReconciliationRecord[]
  invoices: InvoiceApplication[]
  loadingAppointments: LoadingAppointment[]
  costTrials: CostTrial[]
  activeSessionId: string | null

  addWaybill: (waybill: Waybill) => void
  updateWaybillStatus: (id: string, status: Waybill['status']) => void
  addContact: (contact: Contact) => void
  updateContact: (contact: Contact) => void
  deleteContact: (id: string) => void
  addException: (exception: ExceptionCase) => void
  sendMessage: (sessionId: string, message: ChatMessage) => void
  markSessionRead: (sessionId: string) => void
  setActiveSession: (sessionId: string | null) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  confirmReconciliation: (id: string) => void
  addInvoice: (invoice: InvoiceApplication) => void
  updateInvoiceStatus: (id: string, status: InvoiceApplication['status']) => void
  addLoadingAppointment: (appointment: LoadingAppointment) => void
  addCostTrial: (trial: CostTrial) => void
  deleteCostTrial: (id: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  waybills: mockWaybills,
  contacts: mockContacts,
  exceptions: mockExceptions,
  chatSessions: mockChatSessions,
  notifications: mockNotifications,
  reconciliations: mockReconciliations,
  invoices: mockInvoices,
  loadingAppointments: mockLoadingAppointments,
  costTrials: mockCostTrials,
  activeSessionId: null,

  addWaybill: (waybill) =>
    set((state) => ({ waybills: [...state.waybills, waybill] })),

  updateWaybillStatus: (id, status) =>
    set((state) => ({
      waybills: state.waybills.map((w) =>
        w.id === id ? { ...w, status } : w
      ),
    })),

  addContact: (contact) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),

  updateContact: (contact) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contact.id ? contact : c
      ),
    })),

  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),

  addException: (exception) =>
    set((state) => ({ exceptions: [...state.exceptions, exception] })),

  sendMessage: (sessionId, message) =>
    set((state) => {
      const isActive = get().activeSessionId === sessionId
      return {
        chatSessions: state.chatSessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [...s.messages, message],
                lastMessage: message.content,
                lastTime: message.time,
                unread: message.sender === 'service' && !isActive ? s.unread + 1 : s.unread,
              }
            : s
        ),
      }
    }),

  markSessionRead: (sessionId) =>
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.id === sessionId ? { ...s, unread: 0 } : s
      ),
    })),

  setActiveSession: (sessionId) =>
    set((state) => {
      const nextState = { activeSessionId: sessionId } as Partial<AppState>
      if (sessionId) {
        nextState.chatSessions = state.chatSessions.map((s) =>
          s.id === sessionId ? { ...s, unread: 0 } : s
        )
      }
      return nextState
    }),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  confirmReconciliation: (id) =>
    set((state) => ({
      reconciliations: state.reconciliations.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'confirmed' as const,
              confirmedAt: new Date().toLocaleDateString('zh-CN'),
              downloadUrl: `reconciliation-${r.id}.pdf`,
            }
          : r
      ),
    })),

  addInvoice: (invoice) =>
    set((state) => ({ invoices: [...state.invoices, invoice] })),

  updateInvoiceStatus: (id, status) =>
    set((state) => ({
      invoices: state.invoices.map((inv) => {
        if (inv.id !== id) return inv
        const now = new Date().toLocaleDateString('zh-CN')
        if (status === 'approved') {
          return { ...inv, status, approvedAt: now }
        }
        if (status === 'issued') {
          return {
            ...inv,
            status,
            issuedAt: now,
            invoiceNo: `FP${Date.now()}`,
            downloadUrl: `invoice-${inv.id}.pdf`,
          }
        }
        return { ...inv, status }
      }),
    })),

  addLoadingAppointment: (appointment) =>
    set((state) => ({
      loadingAppointments: [...state.loadingAppointments, appointment],
    })),

  addCostTrial: (trial) =>
    set((state) => ({ costTrials: [trial, ...state.costTrials] })),

  deleteCostTrial: (id) =>
    set((state) => ({ costTrials: state.costTrials.filter((t) => t.id !== id) })),
}))
