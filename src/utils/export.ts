import type {
  BackupPayload,
  Bank,
  Client,
  Contractor,
  ContractorStatus,
  CrmData,
  Deal,
  DealStatus,
  ServiceProfile,
} from '@/types'
import { downloadText } from '@/lib/utils'

type LegacyApp = {
  settings?: {
    executor?: {
      name?: string
      status?: string
      inn?: string
      statusText?: string
      taxText?: string
      signText?: string
      globalTerms?: string
    }
    activeBank?: string
  }
  counters?: { contract?: number; act?: number }
  banks?: Record<
    string,
    { name?: string; bik?: string; ks?: string; account?: string; purpose?: string }
  >
  customers?: Record<
    string,
    {
      name?: string
      signer?: string
      basis?: string
      inn?: string
      email?: string
      details?: string
    }
  >
  profiles?: Record<
    string,
    { name?: string; stageName?: string; subject?: string; actItems?: string }
  >
  deals?: Record<
    string,
    {
      name?: string
      customerKey?: string
      profileKey?: string
      contractNumber?: string
      actNumber?: string
      status?: string
      contractDate?: string
      actDate?: string
      startDate?: string
      endDate?: string
      bankKey?: string
      stageName?: string
      subject?: string
      actItems?: string
      netAmount?: string | number
      taxRate?: string | number
      taxAmount?: string | number
      grossAmount?: string | number
      paymentTerms?: string
      actSignDays?: string | number
      penaltyDaily?: string | number
      penaltyMax?: string | number
    }
  >
  receiptItemsByProfile?: Record<string, string[]>
}

function mapContractorStatus(status?: string): ContractorStatus {
  const s = (status || '').toLowerCase()
  if (s.includes('ип') || s === 'ip') return 'ip'
  if (s.includes('ооо') || s === 'ooo') return 'ooo'
  if (s.includes('физлицо') || s === 'individual') return 'individual'
  return 'self-employed'
}

function mapDealStatus(status?: string): DealStatus {
  const map: Record<string, DealStatus> = {
    Черновик: 'draft',
    'Договор отправлен': 'contract_sent',
    'В работе': 'in_progress',
    'Акт отправлен': 'act_sent',
    Оплачено: 'paid',
    draft: 'draft',
    contract_sent: 'contract_sent',
    in_progress: 'in_progress',
    act_sent: 'act_sent',
    paid: 'paid',
  }
  return map[status || ''] || 'draft'
}

function num(v: string | number | undefined, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function legacyToCrmData(legacy: LegacyApp, theme: 'light' | 'dark' = 'light'): CrmData {
  const banks: Bank[] = Object.entries(legacy.banks || {}).map(([id, b]) => ({
    id,
    name: b.name || id,
    bik: b.bik || '',
    corrAccount: b.ks || '',
    accountNumber: b.account || '',
    paymentPurpose: b.purpose || '',
  }))

  const clients: Client[] = Object.entries(legacy.customers || {}).map(([id, c]) => ({
    id,
    name: c.name || id,
    signer: c.signer || '',
    signerPosition: '',
    signingBasis: c.basis || 'Устава',
    inn: c.inn || '',
    email: c.email || '',
    details: c.details || '',
  }))

  const services: ServiceProfile[] = Object.entries(legacy.profiles || {}).map(([id, p]) => ({
    id,
    name: p.name || id,
    stageName: p.stageName || '',
    contractSubject: p.subject || '',
    actText: p.actItems || '',
  }))

  const deals: Deal[] = Object.entries(legacy.deals || {}).map(([id, d]) => ({
    id,
    name: d.name || `${d.contractNumber || ''} • ${d.stageName || ''}`,
    contractNumber: d.contractNumber || '',
    actNumber: d.actNumber || '',
    status: mapDealStatus(d.status),
    clientId: d.customerKey || '',
    serviceProfileId: d.profileKey || '',
    contractDate: d.contractDate || '',
    actDate: d.actDate || '',
    startDate: d.startDate || '',
    endDate: d.endDate || '',
    bankId: d.bankKey || legacy.settings?.activeBank,
    stageName: d.stageName || '',
    workDescription: d.subject || '',
    servicesForAct: d.actItems || '',
    netAmount: num(d.netAmount),
    taxRate: num(d.taxRate, 6),
    taxAmount: num(d.taxAmount),
    contractAmount: num(d.grossAmount),
    paymentTerms: d.paymentTerms || '',
    actSigningDeadline: String(d.actSignDays ?? '3'),
    penaltyPerDay: num(d.penaltyDaily, 0.1),
    penaltyLimit: num(d.penaltyMax, 10),
  }))

  const executor = legacy.settings?.executor || {}
  const contractor: Contractor = {
    fullName: executor.name || '',
    status: mapContractorStatus(executor.status),
    inn: executor.inn || '',
    description: executor.statusText || '',
    taxText: executor.taxText || 'НДС не облагается',
    signature: executor.signText || '',
    generalTerms: executor.globalTerms || '',
    activeBankId: legacy.settings?.activeBank || banks[0]?.id,
  }

  return {
    version: '1.0',
    contractor,
    banks,
    clients,
    services,
    deals,
    counters: {
      contract: legacy.counters?.contract ?? 1,
      act: legacy.counters?.act ?? 1,
    },
    receiptItemsByProfile: legacy.receiptItemsByProfile || {},
    settings: { theme },
  }
}

export function isModernBackup(data: unknown): data is BackupPayload | CrmData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return Array.isArray(d.clients) && Array.isArray(d.deals) && Array.isArray(d.banks)
}

export function isLegacyBackup(data: unknown): data is LegacyApp {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return Boolean(d.customers || d.profiles || d.banks)
}

export function normalizeImportedData(raw: unknown, theme: 'light' | 'dark' = 'light'): CrmData {
  if (isModernBackup(raw)) {
    const data = raw as BackupPayload & CrmData
    return {
      version: data.version || '1.0',
      contractor: data.contractor,
      banks: data.banks || [],
      clients: data.clients || [],
      services: data.services || [],
      deals: data.deals || [],
      counters: data.counters || { contract: 1, act: 1 },
      receiptItemsByProfile: data.receiptItemsByProfile || {},
      settings: { theme: data.settings?.theme || theme },
    }
  }
  if (isLegacyBackup(raw)) {
    return legacyToCrmData(raw, theme)
  }
  throw new Error('Неизвестный формат файла')
}

export function parseLegacyHtml(htmlContent: string): LegacyApp {
  const match = htmlContent.match(/let\s+app\s*=\s*(\{[\s\S]*?\});/)
  if (!match?.[1]) {
    throw new Error('В HTML не найден объект app с данными')
  }
  // eslint-disable-next-line no-new-func
  const legacy = new Function(`return (${match[1]})`)() as LegacyApp
  return legacy
}

export function buildBackupPayload(data: CrmData): BackupPayload {
  return {
    version: data.version || '1.0',
    exportDate: new Date().toISOString(),
    contractor: data.contractor,
    banks: data.banks,
    clients: data.clients,
    services: data.services,
    deals: data.deals,
    counters: data.counters,
    receiptItemsByProfile: data.receiptItemsByProfile,
    settings: data.settings,
  }
}

export function exportToJson(data: CrmData) {
  const payload = buildBackupPayload(data)
  const date = new Date().toISOString().split('T')[0]
  downloadText(
    JSON.stringify(payload, null, 2),
    `crm-backup-${date}.json`,
    'application/json',
  )
  return payload
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsText(file)
  })
}
