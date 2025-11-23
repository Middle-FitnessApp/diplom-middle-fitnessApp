// Общие поля для регистрации и аккаунта
export const COMMON_FIELDS = {
	name: 'Введите Ваше имя',
	login: 'Телефон или email',
	birthDate: 'Выберите дату рождения',
	height: 'Рост (см)',
	weight: 'Вес(кг)',
	chest: 'Обхват груди (см)',
	waist: 'Обхват талии (см)',
	hips: 'Обхват бедер (см)',
	arm: 'Обхват руки (см)',
	leg: 'Обхват ноги (см)',
	goal: 'Выберите цель',
	experience: 'Опыт тренировок',
	medicalInfo: 'Противопоказания, заболевания, лечение',
	diet: 'Текущий рацион питания',
} as const

// Поля только для регистрации
export const REGISTRATION_FIELDS = {
	...COMMON_FIELDS,
	password: 'Пароль',
	passcheck: 'Повторите пароль',
} as const

// Поля только для аккаунта
export const ACCOUNT_FIELDS = {
	...COMMON_FIELDS,
} as const

export type CommonFieldType = keyof typeof COMMON_FIELDS
export type RegistrationFieldType = keyof typeof REGISTRATION_FIELDS
export type AccountFieldType = keyof typeof ACCOUNT_FIELDS
