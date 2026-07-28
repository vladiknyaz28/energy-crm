import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCrmStore } from '@/store'
import { PageHeader, StatCard, Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CONTRACTOR_STATUS_LABELS, DEAL_STATUS_LABELS } from '@/types'
import { formatMoney } from '@/lib/utils'

export function Dashboard() {
  const clients = useCrmStore((s) => s.clients)
  const services = useCrmStore((s) => s.services)
  const deals = useCrmStore((s) => s.deals)
  const contractor = useCrmStore((s) => s.contractor)
  const getActiveBank = useCrmStore((s) => s.getActiveBank)

  const total = useMemo(
    () => deals.reduce((sum, d) => sum + (d.contractAmount || 0), 0),
    [deals],
  )
  const bank = getActiveBank()
  const recent = [...deals].slice(-5).reverse()

  return (
    <div>
      <PageHeader
        title="Дашборд"
        description="Сводка по заказчикам, сделкам и реквизитам. Данные хранятся локально на этом ПК."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/deals">Сделки</Link>
            </Button>
            <Button asChild>
              <Link to="/backup">Резервная копия</Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Заказчики" value={clients.length} />
        <StatCard label="Профили" value={services.length} />
        <StatCard label="Сделки" value={deals.length} />
        <StatCard label="Сумма сделок" value={`${formatMoney(total)} ₽`} />
        <StatCard label="Статус" value={CONTRACTOR_STATUS_LABELS[contractor.status]} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Исполнитель
          </div>
          <div className="text-lg font-bold">{contractor.fullName}</div>
          <div className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {contractor.description}
            <br />
            ИНН: {contractor.inn || '—'}
          </div>
        </Card>
        <Card>
          <div className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Активный банк
          </div>
          <div className="text-lg font-bold">{bank?.name || '—'}</div>
          <div className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Счёт: {bank?.accountNumber || '—'}
            <br />
            БИК: {bank?.bik || '—'}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Последние сделки</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/deals">Все</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {recent.length === 0 ? (
            <div className="text-sm text-[var(--color-muted-foreground)]">Сделок пока нет</div>
          ) : (
            recent.map((d) => {
              const client = clients.find((c) => c.id === d.clientId)
              return (
                <div
                  key={d.id}
                  className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-semibold">
                      {d.contractNumber} · {d.stageName || d.name}
                    </div>
                    <div className="text-sm text-[var(--color-muted-foreground)]">
                      {client?.name || '—'} · {formatMoney(d.contractAmount)} ₽
                    </div>
                  </div>
                  <Badge
                    tone={
                      d.status === 'paid'
                        ? 'success'
                        : d.status === 'draft'
                          ? 'default'
                          : 'info'
                    }
                  >
                    {DEAL_STATUS_LABELS[d.status]}
                  </Badge>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
