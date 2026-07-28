import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCrmStore } from '@/store'
import { PageHeader, Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import type { Bank, Contractor, ContractorStatus } from '@/types'
import { CONTRACTOR_STATUS_LABELS } from '@/types'
import { uid } from '@/lib/utils'

const emptyBank = (): Bank => ({
  id: uid('bank'),
  name: '',
  bik: '',
  corrAccount: '',
  accountNumber: '',
  paymentPurpose: '',
})

export function SettingsPage() {
  const contractor = useCrmStore((s) => s.contractor)
  const banks = useCrmStore((s) => s.banks)
  const updateContractor = useCrmStore((s) => s.updateContractor)
  const upsertBank = useCrmStore((s) => s.upsertBank)
  const deleteBank = useCrmStore((s) => s.deleteBank)
  const setActiveBank = useCrmStore((s) => s.setActiveBank)

  const [form, setForm] = useState<Contractor>(contractor)
  const [bankForm, setBankForm] = useState<Bank | null>(null)

  useEffect(() => {
    setForm(contractor)
  }, [contractor])

  const saveSettings = () => {
    updateContractor(form)
    toast.success('Настройки исполнителя сохранены')
  }

  const openNewBank = () => setBankForm(emptyBank())
  const openBank = (b: Bank) => setBankForm({ ...b })

  const saveBank = () => {
    if (!bankForm) return
    if (!bankForm.name.trim()) {
      toast.error('Укажите название банка')
      return
    }
    upsertBank(bankForm)
    setActiveBank(bankForm.id)
    setBankForm(null)
    toast.success('Банк сохранён')
  }

  return (
    <div>
      <PageHeader
        title="Исполнитель и условия"
        description="Реквизиты, статус, налоговые формулировки и банки для договоров."
        actions={
          <Button onClick={saveSettings}>Сохранить настройки</Button>
        }
      />

      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label>ФИО / наименование</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div>
            <Label>Статус</Label>
            <Select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ContractorStatus })
              }
            >
              {(Object.keys(CONTRACTOR_STATUS_LABELS) as ContractorStatus[]).map((k) => (
                <option key={k} value={k}>
                  {CONTRACTOR_STATUS_LABELS[k]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>ИНН</Label>
            <Input value={form.inn || ''} onChange={(e) => setForm({ ...form, inn: e.target.value })} />
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Описание статуса</Label>
            <Input
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Налоговая формулировка</Label>
            <Input
              value={form.taxText || ''}
              onChange={(e) => setForm({ ...form, taxText: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-3">
          <Label>Подпись</Label>
          <Input
            value={form.signature || ''}
            onChange={(e) => setForm({ ...form, signature: e.target.value })}
          />
        </div>
        <div className="mt-3">
          <Label>Общие условия договора</Label>
          <Textarea
            value={form.generalTerms || ''}
            onChange={(e) => setForm({ ...form, generalTerms: e.target.value })}
          />
        </div>
        <div className="mt-3">
          <Label>Активный банк</Label>
          <Select
            value={form.activeBankId || ''}
            onChange={(e) => {
              setForm({ ...form, activeBankId: e.target.value })
              setActiveBank(e.target.value)
            }}
          >
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Банки</h2>
        <Button variant="soft" onClick={openNewBank}>
          Новый банк
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {banks.map((b) => (
          <Card key={b.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{b.name}</div>
                <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  БИК {b.bik} · счёт {b.accountNumber}
                </div>
                {contractor.activeBankId === b.id ? (
                  <div className="mt-2">
                    <Badge tone="info">Активный</Badge>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openBank(b)}>
                  Изменить
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    deleteBank(b.id)
                    toast.success('Банк удалён')
                  }}
                >
                  Удалить
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={Boolean(bankForm)}
        onOpenChange={(o) => !o && setBankForm(null)}
        title={bankForm?.name ? 'Редактирование банка' : 'Новый банк'}
      >
        {bankForm ? (
          <div className="space-y-3">
            <div>
              <Label>Название</Label>
              <Input
                value={bankForm.name}
                onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>БИК</Label>
                <Input
                  value={bankForm.bik}
                  onChange={(e) => setBankForm({ ...bankForm, bik: e.target.value })}
                />
              </div>
              <div>
                <Label>Корр. счёт</Label>
                <Input
                  value={bankForm.corrAccount}
                  onChange={(e) => setBankForm({ ...bankForm, corrAccount: e.target.value })}
                />
              </div>
              <div>
                <Label>Номер счёта</Label>
                <Input
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Назначение платежа</Label>
              <Textarea
                value={bankForm.paymentPurpose}
                onChange={(e) => setBankForm({ ...bankForm, paymentPurpose: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBankForm(null)}>
                Отмена
              </Button>
              <Button onClick={saveBank}>Сохранить</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
