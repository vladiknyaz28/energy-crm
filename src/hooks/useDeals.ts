import { useCrmStore } from '@/store'
import type { Deal } from '@/types'

export function useDeals() {
  const deals = useCrmStore((s) => s.deals)
  const upsertDeal = useCrmStore((s) => s.upsertDeal)
  const deleteDeal = useCrmStore((s) => s.deleteDeal)
  const clients = useCrmStore((s) => s.clients)

  const getClientName = (deal: Deal) =>
    clients.find((c) => c.id === deal.clientId)?.name || '—'

  return { deals, upsertDeal, deleteDeal, getClientName }
}
