import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { initialData } from '@/data/initialData'
import type {
  Bank,
  Client,
  Contractor,
  CrmData,
  Deal,
  JournalEntry,
  ServiceProfile,
  ThemeMode,
} from '@/types'
import { DEAL_STATUS_LABELS, STORAGE_KEY } from '@/types'
import { padNumber } from '@/utils/calculations'
import { uid } from '@/lib/utils'

interface CrmStore extends CrmData {
  setTheme: (theme: ThemeMode) => void
  updateContractor: (contractor: Partial<Contractor>) => void
  upsertBank: (bank: Bank) => void
  deleteBank: (id: string) => void
  setActiveBank: (id: string) => void
  upsertClient: (client: Client) => void
  deleteClient: (id: string) => void
  upsertService: (service: ServiceProfile) => void
  deleteService: (id: string) => void
  upsertDeal: (deal: Deal) => void
  deleteDeal: (id: string) => void
  nextContractNumber: () => string
  nextActNumber: () => string
  replaceAll: (data: CrmData) => void
  resetToInitial: () => void
  addReceiptItem: (profileId: string, item: string) => void
  getJournal: () => JournalEntry[]
  getActiveBank: () => Bank | undefined
}

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id)
  if (idx === -1) return [...list, item]
  const next = [...list]
  next[idx] = item
  return next
}

export const useCrmStore = create<CrmStore>()(
  persist(
    (set, get) => ({
      ...initialData,

      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),

      updateContractor: (partial) =>
        set((s) => ({ contractor: { ...s.contractor, ...partial } })),

      upsertBank: (bank) =>
        set((s) => ({
          banks: upsertById(s.banks, bank),
          contractor: {
            ...s.contractor,
            activeBankId: s.contractor.activeBankId || bank.id,
          },
        })),

      deleteBank: (id) =>
        set((s) => {
          const banks = s.banks.filter((b) => b.id !== id)
          const activeBankId =
            s.contractor.activeBankId === id ? banks[0]?.id : s.contractor.activeBankId
          return {
            banks,
            contractor: { ...s.contractor, activeBankId },
          }
        }),

      setActiveBank: (id) =>
        set((s) => ({ contractor: { ...s.contractor, activeBankId: id } })),

      upsertClient: (client) => set((s) => ({ clients: upsertById(s.clients, client) })),

      deleteClient: (id) => set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      upsertService: (service) =>
        set((s) => ({ services: upsertById(s.services, service) })),

      deleteService: (id) =>
        set((s) => ({ services: s.services.filter((x) => x.id !== id) })),

      upsertDeal: (deal) =>
        set((s) => {
          const deals = upsertById(s.deals, deal)
          const contractNum = Number(deal.contractNumber) || 0
          const actNum = Number(deal.actNumber) || 0
          return {
            deals,
            counters: {
              contract: Math.max(s.counters.contract, contractNum + 1),
              act: Math.max(s.counters.act, actNum + 1),
            },
          }
        }),

      deleteDeal: (id) => set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),

      nextContractNumber: () => padNumber(get().counters.contract),
      nextActNumber: () => padNumber(get().counters.act),

      replaceAll: (data) => set({ ...data }),

      resetToInitial: () => set({ ...initialData, settings: get().settings }),

      addReceiptItem: (profileId, item) =>
        set((s) => {
          const list = [...(s.receiptItemsByProfile[profileId] || [])]
          if (item && !list.includes(item)) list.push(item)
          return {
            receiptItemsByProfile: {
              ...s.receiptItemsByProfile,
              [profileId]: list,
            },
          }
        }),

      getActiveBank: () => {
        const s = get()
        return s.banks.find((b) => b.id === s.contractor.activeBankId) || s.banks[0]
      },

      getJournal: () => {
        const s = get()
        return s.deals.map((d) => {
          const client = s.clients.find((c) => c.id === d.clientId)
          const hasInn = Boolean(client?.inn?.trim())
          const taxRate = d.taxRate || (hasInn ? 6 : 4)
          const amount = d.contractAmount
          const taxAmount = d.taxAmount || Math.round((amount * taxRate) / 100)
          const netAmount = d.netAmount || amount - taxAmount
          return {
            id: d.id,
            date: d.actDate || d.contractDate || '',
            clientName: client?.name || '—',
            clientType: hasInn ? 'legal' : 'individual',
            inn: client?.inn || '',
            stage: d.stageName,
            contractNumber: d.contractNumber,
            actNumber: d.actNumber,
            amount,
            taxRate,
            taxAmount,
            netAmount,
            status: DEAL_STATUS_LABELS[d.status] || d.status,
          } satisfies JournalEntry
        })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        version: state.version,
        contractor: state.contractor,
        banks: state.banks,
        clients: state.clients,
        services: state.services,
        deals: state.deals,
        counters: state.counters,
        receiptItemsByProfile: state.receiptItemsByProfile,
        settings: state.settings,
      }),
    },
  ),
)

export function createEmptyDeal(partial?: Partial<Deal>): Deal {
  const store = useCrmStore.getState()
  const contractNumber = store.nextContractNumber()
  const actNumber = store.nextActNumber()
  return {
    id: uid('deal'),
    name: '',
    contractNumber,
    actNumber,
    status: 'draft',
    clientId: store.clients[0]?.id || '',
    serviceProfileId: store.services[0]?.id || '',
    contractDate: new Date().toISOString().slice(0, 10),
    actDate: new Date().toISOString().slice(0, 10),
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    bankId: store.contractor.activeBankId,
    stageName: '',
    workDescription: '',
    servicesForAct: '',
    netAmount: 0,
    taxRate: 6,
    taxAmount: 0,
    contractAmount: 0,
    paymentTerms:
      '100% предоплата в течение 3 банковских дней с даты выставления счета/подписания договора',
    actSigningDeadline: '3',
    penaltyPerDay: 0.1,
    penaltyLimit: 10,
    ...partial,
  }
}
