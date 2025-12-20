/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// Запускаем MSW сервер перед всеми тестами
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Очистка после каждого теста
afterEach(() => {
	cleanup()
	server.resetHandlers()
})

// Останавливаем MSW сервер после всех тестов
afterAll(() => server.close())

// Моки для браузерных API
class ResizeObserverMock {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}

globalThis.ResizeObserver = ResizeObserverMock as any

// Мок для matchMedia (используется Ant Design)
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// Мок для IntersectionObserver
class IntersectionObserverMock {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}

globalThis.IntersectionObserver = IntersectionObserverMock as any

// Мок для URL.createObjectURL (для загрузки файлов)
if (!globalThis.URL.createObjectURL) {
	globalThis.URL.createObjectURL = vi.fn(() => 'mock-url')
}
if (!globalThis.URL.revokeObjectURL) {
	globalThis.URL.revokeObjectURL = vi.fn()
}

// Мок для FileReader
class MockFileReader {
	result: string | ArrayBuffer | null = null
	onload: ((event: ProgressEvent<FileReader>) => void) | null = null
	onerror: ((event: ProgressEvent<FileReader>) => void) | null = null

	readAsDataURL() {
		setTimeout(() => {
			this.result = 'data:image/png;base64,mock-base64-string'
			if (this.onload) {
				this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
			}
		}, 0)
	}

	readAsText() {
		setTimeout(() => {
			this.result = 'mock-text-content'
			if (this.onload) {
				this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
			}
		}, 0)
	}
}

globalThis.FileReader = MockFileReader as any

// Мок для navigator.onLine
Object.defineProperty(navigator, 'onLine', {
	writable: true,
	value: true,
})

// Мок для getComputedStyle (используется Ant Design)
window.getComputedStyle = vi.fn().mockImplementation(() => ({
	getPropertyValue: vi.fn(),
})) as any

// Мок для scrollTo
window.scrollTo = vi.fn()
