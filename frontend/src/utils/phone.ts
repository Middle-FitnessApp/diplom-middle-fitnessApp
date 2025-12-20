import {
	PHONE_CLEAN_REGEX,
	DEFAULT_PHONE_COUNTRY,
	PHONE_RU_FORMAT_REGEX,
} from '../constants/phone'

/**
 * Возвращает `tel:` href безопасно или undefined
 */
export function formatTelHref(phone?: string | null): string | undefined {
	if (!phone) return undefined
	const cleaned = phone.replace(PHONE_CLEAN_REGEX, '')
	if (!cleaned) return undefined
	return `tel:${cleaned}`
}

/**
 * Форматирует телефон в читаемый вид для RU: +7 (999) 999-99-99
 * Если номер не похож на российский — возвращает очищённую строку или исходную
 */
export function formatPhoneDisplay(phone?: string | null): string | undefined {
	if (!phone) return undefined
	const cleaned = phone.replace(PHONE_CLEAN_REGEX, '')
	if (!cleaned) return undefined

	// Если есть ведущий плюс — убрать для анализа
	const withPlus = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned

	// Российский вариант: 11 цифр, начинающихся с кода страны
	let digits = withPlus
	if (digits.length === 10) {
		digits = `${DEFAULT_PHONE_COUNTRY}${digits}`
	} else if (digits.length === 11 && digits.startsWith('8')) {
		digits = `${DEFAULT_PHONE_COUNTRY}${digits.slice(1)}`
	}

	if (digits.length === 11 && digits.startsWith(DEFAULT_PHONE_COUNTRY)) {
		const matchResult = digits.match(PHONE_RU_FORMAT_REGEX)
		// Используем именованные группы для читаемости
		if (matchResult && matchResult.groups) {
			const { cc, p1, p2, p3, p4 } = matchResult.groups
			return `+${cc} (${p1}) ${p2}-${p3}-${p4}`
		}
	}

	if (cleaned.startsWith('+')) return cleaned

	return cleaned
}
