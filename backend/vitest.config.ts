import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'
import { existsSync } from 'fs'

if (existsSync('.env.test')) {
	dotenv.config({ path: '.env.test' })
	console.log('✅ Loaded .env.test for integration tests')
} else {
	console.log('⚠️  .env.test not found, using system env (unit tests only)')
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
