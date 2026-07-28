import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCrmStore } from '@/store'
import { PageHeader, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label, Select } from '@/components/ui/input'
import { actHtml, contractHtml, downloadWord, printHtml } from '@/utils/documents'
import type { Bank, Client } from '@/types'

type DocTab = 'contract' | 'act' | 'all'

export function Documents() {
  const deals = useCrmStore((s) => s.deals)
  const clients = useCrmStore((s) => s.clients)
  const banks = useCrmStore((s) => s.banks)
  const contractor = useCrmStore((s) => s.contractor)

  const [dealId, setDealId] = useState(deals[0]?.id || '')
  const [tab, setTab] = useState<DocTab>('contract')

  const ctx = useMemo(() => {
    const deal = deals.find((d) => d.id === dealId)
    if (!deal) return null
    const client: Client = clients.find((c) => c.id === deal.clientId) || {
      id: '',
      name: '',
      signer: '',
      signerPosition: '',
      signingBasis: '',
    }
    const bank: Bank =
      banks.find((b) => b.id === (deal.bankId || contractor.activeBankId)) ||
      banks[0] || {
        id: '',
        name: '',
        bik: '',
        corrAccount: '',
        accountNumber: '',
        paymentPurpose: '',
      }
    return { deal, client, bank, contractor }
  }, [deals, clients, banks, contractor, dealId])

  const html = useMemo(() => {
    if (!ctx) return '<div class="small">Нет сохранённых сделок.</div>'
    if (tab === 'contract') return contractHtml(ctx)
    if (tab === 'act') return actHtml(ctx)
    return `${contractHtml(ctx)}<hr style="margin:28px 0;border:none;border-top:1px solid #bbb">${actHtml(ctx)}`
  }, [ctx, tab])

  const download = (kind: DocTab) => {
    if (!ctx) {
      toast.error('Нет сделки для выгрузки')
      return
    }
    if (kind === 'contract') {
      downloadWord('dogovor.doc', 'Договор', contractHtml(ctx))
    } else if (kind === 'act') {
      downloadWord('akt.doc', 'Акт', actHtml(ctx))
    } else {
      downloadWord(
        'paket-dokumentov.doc',
        'Пакет',
        `${contractHtml(ctx)}<hr>${actHtml(ctx)}`,
      )
    }
    toast.success('Документ скачан')
  }

  return (
    <div>
      <PageHeader
        title="Документы"
        description="Договор и акт используют реквизиты исполнителя, заказчика и выбранный банк."
      />

      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div>
            <Label>Сделка</Label>
            <Select value={dealId} onChange={(e) => setDealId(e.target.value)}>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.contractNumber} · {d.stageName || d.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {(
              [
                ['contract', 'Договор'],
                ['act', 'Акт'],
                ['all', 'Все вместе'],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                variant={tab === key ? 'default' : 'outline'}
                onClick={() => setTab(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => download('contract')}>Скачать договор</Button>
          <Button variant="secondary" onClick={() => download('act')}>
            Скачать акт
          </Button>
          <Button variant="secondary" onClick={() => download('all')}>
            Скачать пакет
          </Button>
          <Button variant="soft" onClick={() => printHtml(html)}>
            Печать
          </Button>
        </div>
      </Card>

      <div className="doc-preview" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
