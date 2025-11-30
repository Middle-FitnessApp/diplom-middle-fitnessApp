const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^(?:\+7|8)\d{10}$/
const cuidRegex = /^[a-z0-9]+$/i

export const Regex = {
	email: emailRegex,
	phone: phoneRegex,
	cuid: cuidRegex,
}
