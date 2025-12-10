const BACKEND_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000'

export const buildPhotoUrl = (p?: string | null) => {
	if (!p) return undefined
	if (p.startsWith('http://') || p.startsWith('https://')) return p
	if (p.startsWith('/')) {
		try {
			const parts = p.split('/')
			const filename = parts.pop() ?? ''
			const encoded = encodeURIComponent(filename)
			const basePath = parts.join('/')
			return `${BACKEND_URL}${basePath}/${encoded}`
		} catch {
			return `${BACKEND_URL}${p}`
		}
	}
	return `${BACKEND_URL}/${p}`
}
