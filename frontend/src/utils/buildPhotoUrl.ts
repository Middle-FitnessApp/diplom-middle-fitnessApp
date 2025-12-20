import { API_BASE_URL } from '../config/api.config'

export const getPhotoUrl = (p?: string | null) => {
	if (!p) return undefined
	// allow absolute http(s), data: and blob: URLs to pass through
	if (
		p.startsWith('http://') ||
		p.startsWith('https://') ||
		p.startsWith('data:') ||
		p.startsWith('blob:')
	)
		return p

	// if path begins with '/', try to encode filename portion
	if (p.startsWith('/')) {
		try {
			const parts = p.split('/')
			const filename = parts.pop() ?? ''
			const encoded = encodeURIComponent(filename)
			const basePath = parts.join('/')
			return `${API_BASE_URL}${basePath}/${encoded}`
		} catch {
			return `${API_BASE_URL}${p}`
		}
	}

	return `${API_BASE_URL}/${p}`
}

// backward compatibility
export const buildPhotoUrl = getPhotoUrl

export default getPhotoUrl
