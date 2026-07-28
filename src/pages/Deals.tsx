import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createEmptyDeal, useCrmStore } from '@/store'
import { PageHeader, Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import type { Deal, DealStatus } from '@/types'
import { DEAL_STATUS_LABELS } from '@/types'
import { calcFromGross, calcFromNet, suggestTaxRate } from '@/utils/calculations'
import { formatMoney } from '@/lib/utils'

export function Deals() {
  const deals = useCrmStore((s) => s.deals)
  const clients = useCrmStore((s) => s.clients)
  const services = useCrmStore((s) => s.services)
  const banks = useCrmStore((s) => s.banks)
  const upsertDeal = useCrmStore((s) => s.upsertDeal)
  const deleteDeal = useCrmStore((s) => s.deleteDeal)
  const nextContractNumber = useCrmStore((s) => s.nextContractNumber)
  const nextActNumber = useCrmStore((s) => s.nextActNumber)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [form, setForm] = useState<Deal | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return deals.filter((d) => {
      const client = clients.find((c) => c.id === d.clientId)
      const statusOk = statusFilter === 'all' || d.status === statusFilter
      const textOk =
        !q ||
        d.contractNumber.toLowerCase().includes(q) ||
        d.stageName.toLowerCase().includes(q) ||
        (client?.name || '').toLowerCase().includes(q)
      return statusOk && textOk
    })
  }, [deals, clients, query, statusFilter])

  const applyProfile = (deal: Deal, profileId: string): Deal => {
    const p = services.find((s) => s.id === profileId)
    if (!p) return { ...deal, serviceProfileId: profileId }
    return {
      ...deal,
      serviceProfileId: profileId,
      stageName: p.stageName,
      workDescription: p.contractSubject,
      servicesForAct: p.actText,
    }
  }

  const save = () => {
    if (!form) return
    if (!form.clientId) {
      toast.error('Выберите заказчика')
      return
    }
    const name = `${form.contractNumber || 'без номера'} • ${form.stageName || 'этап'}`
    upsertDeal({ ...form, name })
    setForm(null)
    toast.success('Сделка сохранена')
  }

  const openNew = () => {
    const deal = createEmptyDeal()
    const client = clients.find((c) => c.id === deal.clientId)
    deal.taxRate = suggestTaxRate(client?.inn)
    if (deal.serviceProfileId) {
      setForm(applyProfile(deal, deal.serviceProfileId))
    } else {
      setForm(deal)
    }
  }

  return (
    <div>
      <PageHeader
        title="Сделки"
        description="Этапы работ, суммы, налоги и статусы по договорам."
        actions={<Button onClick={openNew}>Новая сделка</Button>}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          placeholder="Поиск по номеру, этапу, заказчику..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Все статусы</option>
          {(Object.keys(DEAL_STATUS_LABELS) as DealStatus[]).map((k) => (
            <option key={k} value={k}>
              {DEAL_STATUS_LABELS[k]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((d) => {
          const client = clients.find((c) => c.id === d.clientId)
          return (
            <Card key={d.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-bold">
                    {d.contractNumber} · {d.stageName || d.name}
                  </div>
                  <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    {client?.name || '—'} · {formatMoney(d.contractAmount)} ₽ · налог{' '}
                    {d.taxRate}%
                  </div>
                  <div className="mt-2">
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
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setForm({ ...d })}>
                    Открыть
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      deleteDeal(d.id)
                      toast.success('Сделка удалена')
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal
        open={Boolean(form)}
        onOpenChange={(o) => !o && setForm(null)}
        title="Сделка"
        className="max-w-5xl"
      >
        {form ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <Label>№ договора</Label>
                <Input
                  value={form.contractNumber}
                  onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
                />
              </div>
              <div>
                <Label>№ акта</Label>
                <Input
                  value={form.actNumber}
                  onChange={(e) => setForm({ ...form, actNumber: e.target.value })}
                />
              </div>
              <div>
                <Label>Статус</Label>
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as DealStatus })}
                >
                  {(Object.keys(DEAL_STATUS_LABELS) as DealStatus[]).map((k) => (
                    <option key={k} value={k}>
                      {DEAL_STATUS_LABELS[k]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  variant="soft"
                  className="w-full"
                  onClick={() =>
                    setForm({
                      ...form,
                      contractNumber: nextContractNumber(),
                      actNumber: nextActNumber(),
                    })
                  }
                >
                  Автонумерация
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <Label>Заказчик</Label>
                <Select
                  value={form.clientId}
                  onChange={(e) => {
                    const client = clients.find((c) => c.id === e.target.value)
                    setForm({
                      ...form,
                      clientId: e.target.value,
                      taxRate: suggestTaxRate(client?.inn),
                    })
                  }}
                >
                  <option value="">Выберите</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Профиль услуг</Label>
                <Select
                  value={form.serviceProfileId}
                  onChange={(e) => setForm(applyProfile(form, e.target.value))}
                >
                  <option value="">Выберите</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Дата договора</Label>
                <Input
                  type="date"
                  value={form.contractDate}
                  onChange={(e) => setForm({ ...form, contractDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Дата акта</Label>
                <Input
                  type="date"
                  value={form.actDate}
                  onChange={(e) => setForm({ ...form, actDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Начало</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Окончание</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Банк</Label>
                <Select
                  value={form.bankId || ''}
                  onChange={(e) => setForm({ ...form, bankId: e.target.value })}
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label>Наименование этапа</Label>
              <Input
                value={form.stageName}
                onChange={(e) => setForm({ ...form, stageName: e.target.value })}
              />
            </div>
            <div>
              <Label>Предмет / описание работ</Label>
              <Textarea
                value={form.workDescription}
                onChange={(e) => setForm({ ...form, workDescription: e.target.value })}
              />
            </div>
            <div>
              <Label>Услуги для акта</Label>
              <Textarea
                value={form.servicesForAct}
                onChange={(e) => setForm({ ...form, servicesForAct: e.target.value })}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <Label>Чистыми, ₽</Label>
                <Input
                  type="number"
                  value={form.netAmount}
                  onChange={(e) => setForm({ ...form, netAmount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Налог, %</Label>
                <Input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Налог, ₽</Label>
                <Input
                  type="number"
                  value={form.taxAmount}
                  onChange={(e) => setForm({ ...form, taxAmount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Сумма договора, ₽</Label>
                <Input
                  type="number"
                  value={form.contractAmount}
                  onChange={(e) => setForm({ ...form, contractAmount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="soft"
                size="sm"
                onClick={() => setForm({ ...form, ...calcFromNet(form.netAmount, form.taxRate) })}
              >
                Из чистой суммы
              </Button>
              <Button
                variant="soft"
                size="sm"
                onClick={() =>
                  setForm({ ...form, ...calcFromGross(form.contractAmount, form.taxRate) })
                }
              >
                Из суммы договора
              </Button>
              <Button
                variant="soft"
                size="sm"
                onClick={() => setForm(applyProfile(form, form.serviceProfileId))}
              >
                Подтянуть из профиля
              </Button>
            </div>

            <div>
              <Label>Порядок оплаты</Label>
              <Input
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Срок подписания акта (дней)</Label>
                <Input
                  value={form.actSigningDeadline}
                  onChange={(e) => setForm({ ...form, actSigningDeadline: e.target.value })}
                />
              </div>
              <div>
                <Label>Пеня в день, %</Label>
                <Input
                  type="number"
                  value={form.penaltyPerDay}
                  onChange={(e) => setForm({ ...form, penaltyPerDay: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Лимит пени, %</Label>
                <Input
                  type="number"
                  value={form.penaltyLimit}
                  onChange={(e) => setForm({ ...form, penaltyLimit: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setForm(null)}>
                Отмена
              </Button>
              <Button onClick={save}>Сохранить сделку</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
