/** Format phone for display: +91XXXXXXXXXX → +91 XXXXX XXXXX */
export function formatPhone(phone) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  return phone
}

/** Auto-format to +91XXXXXXXXXX as user types */
export function autoFormatPhone(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length <= 12) return `+${digits}`
  if (!digits.startsWith('91') && digits.length > 0) return `+91${digits.slice(0, 10)}`
  return raw
}

/** Return tel: href */
export function toTelLink(phone) {
  const digits = phone?.replace(/\D/g, '') || ''
  if (!digits) return '#'
  return `tel:${digits.startsWith('91') ? '+' : ''}${digits}`
}
