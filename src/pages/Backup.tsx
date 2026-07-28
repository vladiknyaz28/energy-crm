import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCrmStore } from '@/store'
import { PageHeader, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  buildBackupPayload,
  exportToJson,
  normalizeImportedData,
  parseLegacyHtml,
  readFileAsText,
} from '@/utils/export'

export function Backup() {
  const store = useCrmStore()
  const replaceAll = useCrmStore((s) => s.replaceAll)
  const resetToInitial = useCrmStore((s) => s.resetToInitial)
  const jsonRef = useRef<HTMLInputElement>(null)
  const htmlRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')

  const doExport = () => {
    const payload = exportToJson({
      version: store.version,
      contractor: store.contractor,
      banks: store.banks,
      clients: store.clients,
      services: store.services,
      deals: store.deals,
      counters: store.counters,
      receiptItemsByProfile: store.receiptItemsByProfile,
      settings: store.settings,
    })
    setPreview(JSON.stringify(payload, null, 2))
    toast.success('JSON-бэкап скачан')
  }

  const importJson = async (file: File) => {
    try {
      const text = await readFileAsText(file)
      const raw = JSON.parse(text)
      const data = normalizeImportedData(raw, store.settings.theme)
      replaceAll(data)
      setPreview(JSON.stringify(buildBackupPayload(data), null, 2))
      toast.success('Данные импортированы из JSON')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка импорта JSON')
    }
  }

  const importHtml = async (file: File) => {
    try {
      const text = await readFileAsText(file)
      const legacy = parseLegacyHtml(text)
      const data = normalizeImportedData(legacy, store.settings.theme)
      replaceAll(data)
      setPreview(JSON.stringify(buildBackupPayload(data), null, 2))
      toast.success('Данные импортированы из HTML')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка импорта HTML')
    }
  }

  return (
    <div>
      <PageHeader
        title="Резервная копия"
        description="Экспорт и импорт всей базы для переноса между компьютерами. Данные хранятся в localStorage этого браузера."
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={doExport}>Экспорт в JSON</Button>
          <Button variant="secondary" onClick={() => jsonRef.current?.click()}>
            Импорт из JSON
          </Button>
          <Button variant="soft" onClick={() => htmlRef.current?.click()}>
            Импорт из HTML
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Сбросить базу к начальным данным?')) {
                resetToInitial()
                toast.success('База сброшена к начальным данным')
              }
            }}
          >
            Сбросить к начальным
          </Button>
        </div>
        <input
          ref={jsonRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void importJson(f)
            e.target.value = ''
          }}
        />
        <input
          ref={htmlRef}
          type="file"
          accept="text/html,.html"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void importHtml(f)
            e.target.value = ''
          }}
        />
        <div className="mt-4 space-y-2 text-sm text-[var(--color-muted-foreground)]">
          <p>
            Для переноса на другой ПК: экспортируйте JSON → скопируйте папку проекта или откройте
            приложение на другом компьютере → импортируйте JSON.
          </p>
          <p>
            Импорт из HTML поддерживает файл <code>mini-crm-journal-final.html</code> со встроенным
            объектом <code>app</code>.
          </p>
        </div>
      </Card>

      <Card>
        <div className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Превью данных
        </div>
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl bg-[var(--color-muted)] p-4 text-xs">
          {preview ||
            JSON.stringify(
              buildBackupPayload({
                version: store.version,
                contractor: store.contractor,
                banks: store.banks,
                clients: store.clients,
                services: store.services,
                deals: store.deals,
                counters: store.counters,
                receiptItemsByProfile: store.receiptItemsByProfile,
                settings: store.settings,
              }),
              null,
              2,
            )}
        </pre>
      </Card>
    </div>
  )
}
