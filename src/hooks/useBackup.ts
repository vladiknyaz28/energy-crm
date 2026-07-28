import { useCrmStore } from '@/store'
import {
  exportToJson,
  normalizeImportedData,
  parseLegacyHtml,
  readFileAsText,
} from '@/utils/export'

export function useBackup() {
  const store = useCrmStore()
  const replaceAll = useCrmStore((s) => s.replaceAll)

  const exportJson = () =>
    exportToJson({
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

  const importJsonFile = async (file: File) => {
    const text = await readFileAsText(file)
    const data = normalizeImportedData(JSON.parse(text), store.settings.theme)
    replaceAll(data)
    return data
  }

  const importHtmlFile = async (file: File) => {
    const text = await readFileAsText(file)
    const data = normalizeImportedData(parseLegacyHtml(text), store.settings.theme)
    replaceAll(data)
    return data
  }

  return { exportJson, importJsonFile, importHtmlFile }
}
