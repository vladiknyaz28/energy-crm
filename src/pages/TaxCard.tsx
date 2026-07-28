import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCrmStore } from '@/store'
import { PageHeader, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/input'
import { downloadWord, receiptHtml } from '@/utils/documents'
import { formatDateRu } from '@/lib/utils'

export function TaxCard() {
  const deals = useCrmStore((s) => s.deals)
  const clients = useCrmStore((s) => s.clients)
  const receiptItemsByProfile = useCrmStore((s) => s.receiptItemsByProfile)
  const addReceiptItem = useCrmStore((s) => s.addReceiptItem)

  const [dealId, setDealId] = useState(deals[0]?.id || '')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState(0)
  const [inn, setInn] = useState('')
  const [stage, setStage] = useState('')
  const [itemName, setItemName] = useState('')
  const [basis, setBasis] = useState('')
  const [preset, setPreset] = useState('')

  const deal = deals.find((d) => d.id === dealId)
  const client = clients.find((c) => c.id === deal?.clientId)
  const presets = deal ? receiptItemsByProfile[deal.serviceProfileId] || [] : []

  const fillFromDeal = (id = dealId) => {
    const d = deals.find((x) => x.id === id)
    if (!d) return
    const c = clients.find((x) => x.id === d.clientId)
    setDealId(id)
    setAmount(d.contractAmount)
    setInn(c?.inn || '')
    setStage(d.stageName)
    setItemName(d.stageName || '')
    setBasis(
      `Оплата услуг по договору № ${d.contractNumber} от ${formatDateRu(d.contractDate)}, этап: ${d.stageName}`,
    )
  }

  useEffect(() => {
    if (dealId) fillFromDeal(dealId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const html = useMemo(
    () =>
      receiptHtml({
        paymentDate,
        amount,
        clientName: client?.name || '',
        inn,
        itemName,
        basis,
        contractNumber: deal?.contractNumber || '',
        contractDate: deal?.contractDate || '',
        stage,
      }),
    [paymentDate, amount, client, inn, itemName, basis, deal, stage],
  )

  const copyField = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value)
    toast.success(`Скопировано: ${label}`)
  }

  return (
    <div>
      <PageHeader
        title="Мой налог"
        description="Карточка чека для быстрого переноса данных в приложение «Мой налог»."
      />

      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Сделка</Label>
            <Select
              value={dealId}
              onChange={(e) => {
                setDealId(e.target.value)
                fillFromDeal(e.target.value)
              }}
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.contractNumber} · {d.stageName || d.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Дата оплаты</Label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <Label>Сумма поступления</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>ИНН заказчика</Label>
            <Input value={inn} onChange={(e) => setInn(e.target.value)} />
          </div>
          <div>
            <Label>Этап / вид работ</Label>
            <Input value={stage} onChange={(e) => setStage(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Типовое наименование</Label>
            <Select
              value={preset}
              onChange={(e) => {
                setPreset(e.target.value)
                if (e.target.value) setItemName(e.target.value)
              }}
            >
              <option value="">Выберите типовое наименование</option>
              {presets.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Наименование для чека</Label>
            <Input value={itemName} onChange={(e) => setItemName(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <Label>Основание платежа</Label>
          <Input value={basis} onChange={(e) => setBasis(e.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="soft" onClick={() => fillFromDeal()}>
            Подтянуть из сделки
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (!deal || !itemName.trim()) return
              addReceiptItem(deal.serviceProfileId, itemName.trim())
              toast.success('Наименование добавлено в шаблоны')
            }}
          >
            Добавить своё наименование
          </Button>
          <Button
            onClick={() => {
              downloadWord('kartochka-cheka.doc', 'Чек', html)
              toast.success('Карточка скачана')
            }}
          >
            Скачать карточку
          </Button>
        </div>
      </Card>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" onClick={() => copyField('Сумма', String(amount))}>
          Копировать сумму
        </Button>
        <Button variant="outline" onClick={() => copyField('ИНН', inn)}>
          Копировать ИНН
        </Button>
        <Button variant="outline" onClick={() => copyField('Услуга', itemName)}>
          Копировать услугу
        </Button>
        <Button variant="outline" onClick={() => copyField('Основание', basis)}>
          Копировать основание
        </Button>
      </div>

      <div className="doc-preview" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
