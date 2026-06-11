import { create } from 'zustand'
import type { Waybill, Contact, ExceptionCase, ChatSession, ChatMessage, Notification, ReconciliationRecord, InvoiceApplication, LoadingAppointment } from '@/types'
import { mockWaybills, mockContacts, mockExceptions, mockChatSessions, mockNotifications, mockReconciliations, mockInvoices, mockLoadingAppointments } from '@/data/mockData'

interface AppState {
  waybills: Waybill[]
  contacts: Contact[]
  exceptions: ExceptionCase[]
  chatSessions: ChatSession[]
  notifications: Notification[]
  reconciliations: ReconciliationRecord[]
  invoices: InvoiceApplication[]
  loadingAppointments: LoadingAppointment[]

  addWaybill: (waybill: Waybill) => void
  updateWaybillStatus: (id: string, status: Waybill['status']) => void
  addContact: (contact: Contact) => void
  updateContact: (contact: Contact) => void
  deleteContact: (id: string) => void
  addException: (exception: ExceptionCase) => void
  sendMessage: (sessionId: string, message: ChatMessage) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  confirmReconciliation: (id: string) => void
  addInvoice: (invoice: InvoiceApplication) => void
  addLoadingAppointment: (appointment: LoadingAppointment) => void
}

export const useStore = create<AppState>((set) => ({
  waybills: mockWaybills,
  contacts: mockContacts,
  exceptions: mockExceptions,
  chatSessions: mockChatSessions,
  notifications: mockNotifications,
  reconciliations: mockReconciliations,
  invoices: mockInvoices,
  loadingAppointments: mockLoadingAppointments,

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
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, message],
              lastMessage: message.content,
              lastTime: message.time,
              unread: message.sender === 'service' ? s.unread + 1 : 0,
            }
          : s
      ),
    })),

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
        r.id === id ? { ...r, status: 'confirmed' as const } : r
      ),
    })),

  addInvoice: (invoice) =>
    set((state) => ({ invoices: [...state.invoices, invoice] })),

  addLoadingAppointment: (appointment) =>
    set((state) => ({
      loadingAppointments: [...state.loadingAppointments, appointment],
    })),
}))
