import type { MutableRefObject } from 'react'

export function createAndTrackObjectUrl(
	file: File,
	ref: MutableRefObject<string | null>,
) {
	if (ref.current && ref.current.startsWith('blob:')) {
		try {
			URL.revokeObjectURL(ref.current)
		} catch {
			// ignore
		}
	}
	const url = URL.createObjectURL(file)
	ref.current = url
	return url
}

export function revokeObjectUrl(url?: string | null) {
	if (!url) return
	try {
		if (url.startsWith('blob:')) URL.revokeObjectURL(url)
	} catch {
		// ignore
	}
}

export function revokeTrackedRefIfMatches(
	ref: MutableRefObject<string | null>,
	url?: string | null,
) {
	if (!url) return
	if (ref.current === url) {
		revokeObjectUrl(url)
		ref.current = null
	}
}

export function revokeTrackedRef(ref: MutableRefObject<string | null>) {
	if (ref.current) {
		revokeObjectUrl(ref.current)
		ref.current = null
	}
}
