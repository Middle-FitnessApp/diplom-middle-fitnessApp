import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'
import { existsSync } from 'fs'

if (existsSync('.env.test')) {
	dotenv.config({ path: '.env.test' })
	console.log('✅ Загружен .env.test для интеграционных тестов.')
} else {
	console.log('⚠️  .env.test не найден, используется системная среда (только модульные тесты)')
}

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		exclude: ['node_modules', 'dist'],
		coverage: {
			enabled: false,
			provider: 'v8',
		},
	},
})
