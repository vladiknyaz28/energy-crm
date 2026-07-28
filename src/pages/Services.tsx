import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCrmStore } from '@/store'
import { PageHeader, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import type { ServiceProfile } from '@/types'
import { uid } from '@/lib/utils'

const emptyService = (): ServiceProfile => ({
  id: uid('service'),
  name: '',
  stageName: '',
  contractSubject: '',
  actText: '',
})

export function Services() {
  const services = useCrmStore((s) => s.services)
  const upsertService = useCrmStore((s) => s.upsertService)
  const deleteService = useCrmStore((s) => s.deleteService)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<ServiceProfile | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return services
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.stageName.toLowerCase().includes(q),
    )
  }, [services, query])

  const save = () => {
    if (!form) return
    if (!form.name.trim()) {
      toast.error('Укажите название профиля')
      return
    }
    upsertService(form)
    setForm(null)
    toast.success('Профиль сохранён')
  }

  return (
    <div>
      <PageHeader
        title="Профили услуг"
        description="Шаблоны предмета договора и текста акта."
        actions={<Button onClick={() => setForm(emptyService())}>Новый профиль</Button>}
      />

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Поиск профиля..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{s.name}</div>
                <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {s.stageName || 'Этап не указан'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setForm({ ...s })}>
                  Открыть
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    deleteService(s.id)
                    toast.success('Профиль удалён')
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
        title="Профиль услуг"
      >
        {form ? (
          <div className="space-y-3">
            <div>
              <Label>Название</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Наименование этапа</Label>
              <Input
                value={form.stageName}
                onChange={(e) => setForm({ ...form, stageName: e.target.value })}
              />
            </div>
            <div>
              <Label>Предмет договора</Label>
              <Textarea
                className="min-h-28"
                value={form.contractSubject}
                onChange={(e) => setForm({ ...form, contractSubject: e.target.value })}
              />
            </div>
            <div>
              <Label>Текст для акта</Label>
              <Textarea
                className="min-h-28"
                value={form.actText}
                onChange={(e) => setForm({ ...form, actText: e.target.value })}
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
