import type { Bank, Client, Contractor, Deal } from '@/types'
import { escapeHtml, formatDateRu, formatMoney, downloadText } from '@/lib/utils'

export interface DocContext {
  deal: Deal
  client: Client
  bank: Bank
  contractor: Contractor
}

export function contractHtml(ctx: DocContext) {
  const { deal: d, client: c, bank: b, contractor: e } = ctx
  return `<h1>ДОГОВОР ВОЗМЕЗДНОГО ОКАЗАНИЯ УСЛУГ № ${escapeHtml(d.contractNumber)}</h1>
<p>г. Коломна<br>«${escapeHtml(formatDateRu(d.contractDate))}»</p>
<p><strong>Исполнитель:</strong> ${escapeHtml(e.fullName)}, ${escapeHtml(e.description || '')}, именуемый в дальнейшем «Исполнитель», с одной стороны, и <strong>Заказчик:</strong> ${escapeHtml(c.name || '')}, в лице ${escapeHtml(c.signer || '')}, действующего на основании ${escapeHtml(c.signingBasis || '')}, именуемый в дальнейшем «Заказчик», с другой стороны, заключили настоящий договор о нижеследующем.</p>
<h2>1. Предмет договора</h2>
<p>1.1. Исполнитель обязуется по заданию Заказчика оказать услуги по этапу «${escapeHtml(d.stageName)}», а Заказчик обязуется принять оказанные услуги и оплатить их.</p>
<p>1.2. Содержание работ: ${escapeHtml(d.workDescription)}</p>
<p>1.3. Перечень услуг по этапу:</p>
<p>${escapeHtml(d.servicesForAct)}</p>
<h2>2. Сроки оказания услуг</h2>
<p>2.1. Срок оказания услуг: с «${escapeHtml(formatDateRu(d.startDate))}» по «${escapeHtml(formatDateRu(d.endDate))}».</p>
<h2>3. Стоимость и порядок оплаты</h2>
<p>3.1. Стоимость услуг составляет <strong>${formatMoney(d.contractAmount)} руб.</strong>.</p>
<p>3.2. ${escapeHtml(e.taxText || 'НДС не облагается')}.</p>
<p>3.3. Оплата производится в следующем порядке: ${escapeHtml(d.paymentTerms)}.</p>
<p>3.4. Платеж производится по реквизитам Исполнителя, указанным в настоящем договоре или дополнительно согласованным сторонами.</p>
<h2>4. Сдача и приемка услуг</h2>
<p>4.1. По завершении этапа Исполнитель направляет результат услуг и/или акт.</p>
<p>4.2. Заказчик обязан в течение ${escapeHtml(d.actSigningDeadline)} рабочих дней с даты получения акта подписать его либо направить мотивированные замечания.</p>
<p>4.3. Если замечания не направлены в указанный срок, услуги считаются принятыми без замечаний.</p>
<h2>5. Ответственность сторон</h2>
<p>5.1. При просрочке оплаты Заказчик уплачивает пеню в размере ${escapeHtml(d.penaltyPerDay)} % от суммы задолженности за каждый день просрочки, но не более ${escapeHtml(d.penaltyLimit)} % от суммы задолженности.</p>
<h2>6. Прочие условия</h2>
<p>6.1. ${escapeHtml(e.generalTerms || '')}</p>
<h2>7. Реквизиты и подписи сторон</h2>
<table>
<tr><th>Исполнитель</th><th>Заказчик</th></tr>
<tr>
<td>${escapeHtml(e.fullName)}<br>${escapeHtml(e.description || '')}<br>ИНН: ${escapeHtml(e.inn || '')}<br>Номер счета: ${escapeHtml(b.accountNumber || '')}<br>Банк-получатель: ${escapeHtml(b.name || '')}<br>БИК: ${escapeHtml(b.bik || '')}<br>Корр. счет: ${escapeHtml(b.corrAccount || '')}<br>Назначение платежа: ${escapeHtml(b.paymentPurpose || '')}<br><br>Подпись: _______________ / ${escapeHtml(e.signature || '')} /</td>
<td>${escapeHtml(c.name || '')}<br>${escapeHtml(c.details || '')}<br>E-mail: ${escapeHtml(c.email || '')}<br><br>Подпись: _______________ / __________________ /</td>
</tr>
</table>`
}

export function actHtml(ctx: DocContext) {
  const { deal: d, client: c, contractor: e } = ctx
  return `<h1>АКТ ОКАЗАННЫХ УСЛУГ № ${escapeHtml(d.actNumber)}</h1>
<p>к Договору возмездного оказания услуг № ${escapeHtml(d.contractNumber)} от «${escapeHtml(formatDateRu(d.contractDate))}»</p>
<p>г. Коломна<br>«${escapeHtml(formatDateRu(d.actDate))}»</p>
<p><strong>Исполнитель:</strong> ${escapeHtml(e.fullName)}, ${escapeHtml(e.description || '')}, и <strong>Заказчик:</strong> ${escapeHtml(c.name || '')}, в лице ${escapeHtml(c.signer || '')}, действующего на основании ${escapeHtml(c.signingBasis || '')}, составили настоящий Акт о нижеследующем.</p>
<p>1. Исполнитель оказал, а Заказчик принял следующие услуги:</p>
<p>${escapeHtml(d.servicesForAct)}</p>
<p>2. Период оказания услуг: с «${escapeHtml(formatDateRu(d.startDate))}» по «${escapeHtml(formatDateRu(d.endDate))}».</p>
<p>3. Стоимость оказанных услуг составляет <strong>${formatMoney(d.contractAmount)} руб.</strong>.</p>
<p>4. ${escapeHtml(e.taxText || 'НДС не облагается')}.</p>
<p>5. Претензий по объему, качеству и срокам оказания услуг не имеется.</p>
<table>
<tr>
<td><strong>Исполнитель</strong><br><br>_______________ / ${escapeHtml(e.signature || '')} /</td>
<td><strong>Заказчик</strong><br><br>_______________ / __________________ /</td>
</tr>
</table>`
}

export interface ReceiptData {
  paymentDate: string
  amount: number
  clientName: string
  inn: string
  itemName: string
  basis: string
  contractNumber: string
  contractDate: string
  stage: string
}

export function receiptHtml(r: ReceiptData) {
  return `<h1>КАРТОЧКА ДЛЯ ЧЕКА «МОЙ НАЛОГ»</h1>
<table>
<tr><th>Поле</th><th>Значение</th></tr>
<tr><td>Дата поступления оплаты</td><td>${escapeHtml(formatDateRu(r.paymentDate))}</td></tr>
<tr><td>Сумма поступления</td><td>${formatMoney(r.amount)} руб.</td></tr>
<tr><td>Заказчик</td><td>${escapeHtml(r.clientName)}</td></tr>
<tr><td>ИНН заказчика</td><td>${escapeHtml(r.inn)}</td></tr>
<tr><td>Наименование товара / услуги</td><td>${escapeHtml(r.itemName)}</td></tr>
<tr><td>Основание платежа</td><td>${escapeHtml(r.basis)}</td></tr>
<tr><td>Договор</td><td>№ ${escapeHtml(r.contractNumber)} от ${escapeHtml(formatDateRu(r.contractDate))}</td></tr>
<tr><td>Этап / вид работ</td><td>${escapeHtml(r.stage)}</td></tr>
</table>`
}

function docWrap(title: string, body: string) {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${title}</title></head><body>${body}</body></html>`
}

export function downloadWord(filename: string, title: string, bodyHtml: string) {
  downloadText(docWrap(title, bodyHtml), filename, 'application/msword')
}

export function printHtml(bodyHtml: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Печать</title>
<style>
body{font-family:"Times New Roman",serif;padding:32px;color:#111}
h1{font-size:20px;text-align:center}h2{font-size:16px}
p,td,th{font-size:14px;line-height:1.45}
table{width:100%;border-collapse:collapse}
td,th{border:1px solid #bbb;padding:6px 8px;vertical-align:top}
</style></head><body>${bodyHtml}</body></html>`)
  win.document.close()
  win.focus()
  win.print()
}
