import { useMemo } from 'react'
import { useCrmStore } from '@/store'
import { PageHeader, StatCard, Card } from '@/components/ui/card'
import { formatMoney } from '@/lib/utils'

export function Journal() {
  const getJournal = useCrmStore((s) => s.getJournal)
  const rows = getJournal()

  const stats = useMemo(() => {
    const gross = rows.reduce((s, r) => s + r.amount, 0)
    const taxFl = rows.filter((r) => r.taxRate === 4).reduce((s, r) => s + r.taxAmount, 0)
    const taxUl = rows.filter((r) => r.taxRate === 6).reduce((s, r) => s + r.taxAmount, 0)
    const taxTotal = rows.reduce((s, r) => s + r.taxAmount, 0)
    return { gross, taxFl, taxUl, taxTotal }
  }, [rows])

  return (
    <div>
      <PageHeader
        title="Журнал"
        description="Строки строятся автоматически из сохранённых сделок. ФЛ — 4%, ЮЛ/ИП — 6% (если заполнен ИНН)."
      />

      <div className="mb-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100">
        Напоминание по НПД: если у заказчика заполнен ИНН, строка считается как ЮЛ/ИП (6%); если ИНН
        пустой — как ФЛ (4%).
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Сделок" value={rows.length} />
        <StatCard label="Общая сумма" value={`${formatMoney(stats.gross)} ₽`} />
        <StatCard label="Налог ФЛ 4%" value={`${formatMoney(stats.taxFl)} ₽`} />
        <StatCard label="Налог ЮЛ 6%" value={`${formatMoney(stats.taxUl)} ₽`} />
        <StatCard label="Всего налога" value={`${formatMoney(stats.taxTotal)} ₽`} />
      </div>

      <Card>
        <div className="overflow-auto">
          <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                <th className="p-2">Дата</th>
                <th className="p-2">Контрагент</th>
                <th className="p-2">Тип</th>
                <th className="p-2">ИНН</th>
                <th className="p-2">Этап</th>
                <th className="p-2">Договор</th>
                <th className="p-2">Акт</th>
                <th className="p-2">Сумма</th>
                <th className="p-2">Ставка</th>
                <th className="p-2">Налог</th>
                <th className="p-2">К выплате</th>
                <th className="p-2">Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--color-border)]/70">
                  <td className="p-2 whitespace-nowrap">{r.date}</td>
                  <td className="p-2">{r.clientName}</td>
                  <td className="p-2">{r.clientType === 'legal' ? 'ЮЛ/ИП' : 'ФЛ'}</td>
                  <td className="p-2">{r.inn || '—'}</td>
                  <td className="p-2">{r.stage}</td>
                  <td className="p-2">{r.contractNumber}</td>
                  <td className="p-2">{r.actNumber}</td>
                  <td className="p-2 whitespace-nowrap">{formatMoney(r.amount)}</td>
                  <td className="p-2">{r.taxRate}%</td>
                  <td className="p-2 whitespace-nowrap">{formatMoney(r.taxAmount)}</td>
                  <td className="p-2 whitespace-nowrap">{formatMoney(r.netAmount)}</td>
                  <td className="p-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
