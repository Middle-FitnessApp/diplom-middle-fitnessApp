import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import { existsSync, renameSync } from 'fs'

function isContainerRunning(): boolean {
	try {
		const output = execSync('docker ps -q --filter name=backend-postgres-test-1', {
			encoding: 'utf8',
		})
		return output.trim().length > 0
	} catch (error) {
		return false
	}
}

async function waitForDatabase(maxRetries = 30, delay = 2000) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			const testClient = new PrismaClient()
			await testClient.$connect()
			await testClient.$disconnect()
			console.log('✅ База данных готова')
			return
		} catch (error) {
			console.log(`⏳ Ожидание БД... Попытка ${i + 1}/${maxRetries}`)
			await new Promise((resolve) => setTimeout(resolve, delay))
		}
	}
	throw new Error('База данных не стала доступна после максимального количества попыток')
}

export async function setup() {
	console.log('🚀 Глобальная настройка тестовой базы данных...')

	// Проверить, запущен ли контейнер
	if (!isContainerRunning()) {
		console.log('🚀 Запуск тестовой базы данных через Docker...')
		try {
			execSync('docker-compose -f docker-compose.test.yml up -d', { stdio: 'inherit' })
			console.log('✅ Контейнер запущен')
		} catch (error) {
			console.error('❌ Не удалось запустить контейнер:', error)
			throw error
		}
	} else {
		console.log('ℹ️  Контейнер уже запущен')
	}

	// Ждать readiness БД
	await waitForDatabase()

	// Проверить, применены ли миграции (проверить наличие таблиц)
	try {
		const testClient = new PrismaClient()
		await testClient.$connect()
		await testClient.user.findFirst()
		await testClient.$disconnect()
		console.log('ℹ️  Миграции уже применены')
	} catch (error) {
		// Миграции не применены, применить их
		console.log('📦 Применение миграций...')
		try {
			// Переименовать .env чтобы Prisma использовал только .env.test
			let envRenamed = false
			if (existsSync('.env')) {
				renameSync('.env', '.env.backup')
				envRenamed = true
			}

			execSync(
				'npx dotenv -e .env.test -- npx prisma db push --accept-data-loss --force-reset',
				{ stdio: 'inherit' },
			)

			// Вернуть .env
			if (envRenamed) {
				renameSync('.env.backup', '.env')
			}
			console.log('✅ Миграции применены')
		} catch (error) {
			console.error('❌ Не удалось применить миграции:', error)
			throw error
		}
	}

	console.log('🧪 Тестовая база данных подключена и готова')
}

export async function teardown() {
	console.log('🛑 Глобальная остановка тестовой базы данных...')
	try {
		if (isContainerRunning()) {
			execSync('docker-compose -f docker-compose.test.yml down -v', { stdio: 'inherit' })
			console.log('✅ Контейнер остановлен')
		} else {
			console.log('ℹ️  Контейнер уже остановлен')
		}
	} catch (error) {
		console.error('❌ Не удалось остановить контейнер:', error)
	}
}
