import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCrmStore } from '@/store'
import { PageHeader, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import type { Client } from '@/types'
import { uid } from '@/lib/utils'

const emptyClient = (): Client => ({
  id: uid('client'),
  name: '',
  signer: '',
  signerPosition: '',
  signingBasis: 'Устава',
  inn: '',
  email: '',
  details: '',
})

export function Clients() {
  const clients = useCrmStore((s) => s.clients)
  const upsertClient = useCrmStore((s) => s.upsertClient)
  const deleteClient = useCrmStore((s) => s.deleteClient)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<Client | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.inn || '').includes(q) ||
        (c.email || '').toLowerCase().includes(q),
    )
  }, [clients, query])

  const save = () => {
    if (!form) return
    if (!form.name.trim()) {
      toast.error('Укажите наименование заказчика')
      return
    }
    upsertClient(form)
    setForm(null)
    toast.success('Заказчик сохранён')
  }

  return (
    <div>
      <PageHeader
        title="Заказчики"
        description="Карточки контрагентов с реквизитами для договоров и актов."
        actions={
          <Button onClick={() => setForm(emptyClient())}>Новый заказчик</Button>
        }
      />

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Поиск по имени, ИНН, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  ИНН: {c.inn || '—'}
                  <br />
                  {c.email || 'Email не указан'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setForm({ ...c })}>
                  Открыть
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    deleteClient(c.id)
                    toast.success('Заказчик удалён')
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
        open={Boolean(form)}
        onOpenChange={(o) => !o && setForm(null)}
        title="Карточка заказчика"
      >
        {form ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Наименование</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Подписант</Label>
                <Input
                  value={form.signer}
                  onChange={(e) => setForm({ ...form, signer: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Должность</Label>
                <Input
                  value={form.signerPosition}
                  onChange={(e) => setForm({ ...form, signerPosition: e.target.value })}
                />
              </div>
              <div>
                <Label>Основание</Label>
                <Input
                  value={form.signingBasis}
                  onChange={(e) => setForm({ ...form, signingBasis: e.target.value })}
                />
              </div>
              <div>
                <Label>ИНН</Label>
                <Input value={form.inn || ''} onChange={(e) => setForm({ ...form, inn: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Реквизиты</Label>
              <Textarea
                className="min-h-36"
                value={form.details || ''}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setForm(null)}>
                Отмена
              </Button>
              <Button onClick={save}>Сохранить</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
