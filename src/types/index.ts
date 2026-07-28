export type ContractorStatus = 'self-employed' | 'ip' | 'individual' | 'ooo'
export type DealStatus = 'draft' | 'contract_sent' | 'in_progress' | 'act_sent' | 'paid'
export type ClientType = 'individual' | 'legal'
export type ThemeMode = 'light' | 'dark'

export interface Bank {
  id: string
  name: string
  bik: string
  corrAccount: string
  accountNumber: string
  paymentPurpose: string
}

export interface Contractor {
  fullName: string
  status: ContractorStatus
  inn?: string
  description?: string
  taxText?: string
  signature?: string
  generalTerms?: string
  activeBankId?: string
}

export interface Client {
  id: string
  name: string
  signer: string
  signerPosition: string
  signingBasis: string
  inn?: string
  email?: string
  details?: string
}

export interface ServiceProfile {
  id: string
  name: string
  stageName: string
  contractSubject: string
  actText: string
}

export interface Deal {
  id: string
  name: string
  contractNumber: string
  actNumber: string
  status: DealStatus
  clientId: string
  serviceProfileId: string
  contractDate: string
  actDate: string
  startDate: string
  endDate: string
  bankId?: string
  stageName: string
  workDescription: string
  servicesForAct: string
  netAmount: number
  taxRate: number
  taxAmount: number
  contractAmount: number
  paymentTerms: string
  actSigningDeadline: string
  penaltyPerDay: number
  penaltyLimit: number
}

export interface JournalEntry {
  id: string
  date: string
  clientName: string
  clientType: ClientType
  inn?: string
  stage: string
  contractNumber: string
  actNumber: string
  amount: number
  taxRate: number
  taxAmount: number
  netAmount: number
  status: string
}

export interface Counters {
  contract: number
  act: number
}

export interface AppSettings {
  theme: ThemeMode
}

export interface CrmData {
  version: string
  contractor: Contractor
  banks: Bank[]
  clients: Client[]
  services: ServiceProfile[]
  deals: Deal[]
  counters: Counters
  receiptItemsByProfile: Record<string, string[]>
  settings: AppSettings
}

export interface BackupPayload {
  version: string
  exportDate: string
  contractor: Contractor
  banks: Bank[]
  clients: Client[]
  services: ServiceProfile[]
  deals: Deal[]
  counters: Counters
  receiptItemsByProfile: Record<string, string[]>
  settings: AppSettings
}

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  draft: 'Черновик',
  contract_sent: 'Договор отправлен',
  in_progress: 'В работе',
  act_sent: 'Акт отправлен',
  paid: 'Оплачено',
}

export const CONTRACTOR_STATUS_LABELS: Record<ContractorStatus, string> = {
  'self-employed': 'Самозанятый (НПД)',
  ip: 'ИП',
  individual: 'Физлицо',
  ooo: 'ООО',
}

export const STORAGE_KEY = 'energy-crm-data'
