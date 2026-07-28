/** Расчёт налогов НПД: 4% ФЛ, 6% ЮЛ/ИП */

export function calcFromNet(netAmount: number, taxRate: number) {
  const rate = taxRate / 100
  const contractAmount = Math.ceil(netAmount / (1 - rate))
  const taxAmount = contractAmount - netAmount
  return { netAmount, taxAmount, contractAmount, taxRate }
}

export function calcFromGross(contractAmount: number, taxRate: number) {
  const taxAmount = Math.round((contractAmount * taxRate) / 100)
  const netAmount = Math.round(contractAmount - taxAmount)
  return { netAmount, taxAmount, contractAmount, taxRate }
}

export function suggestTaxRate(clientInn?: string) {
  return clientInn?.trim() ? 6 : 4
}

export function padNumber(n: number, size = 3) {
  return String(n).padStart(size, '0')
}
