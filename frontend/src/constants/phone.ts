/**
 * Константы связанные с телефоном
 */
export const PHONE_CLEAN_REGEX = /[^+\d]/g

// Значение по умолчанию для национального кода (используется в formatPhoneDisplay)
export const DEFAULT_PHONE_COUNTRY = '7'

// Регекс для разбора российского номера в формате 7XXXXXXXXXX
// Группы: cc - код страны, p1 - три цифры (код), p2 - три цифры, p3 - две цифры, p4 - две
export const PHONE_RU_FORMAT_REGEX =
	/(?<cc>\d)(?<p1>\d{3})(?<p2>\d{3})(?<p3>\d{2})(?<p4>\d{2})/
