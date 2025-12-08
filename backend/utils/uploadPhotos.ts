import { FastifyRequest } from 'fastify'
import { ApiError } from './ApiError.js'
import { MAX_PHOTO_SIZE } from '../consts/file.js'
import { supabase, PHOTOS_BUCKET } from './supabase.js'
import fs from 'fs'
import path from 'path'

interface UploadResult {
	body: Record<string, string>
	files: Record<string, string>
}

/**
 * Определяем режим хранения по NODE_ENV:
 * - development (npm run dev) → локальное хранение в uploads/photos
 * - production (npm run build/start) → Supabase Storage
 */
const isDevelopment = process.env.NODE_ENV !== 'production'
const isLocalStorage = isDevelopment || !supabase

// Логируем режим при старте
console.log(`📦 Storage mode: ${isLocalStorage ? 'LOCAL (uploads/photos)' : 'SUPABASE'}`)

/**
 * Обрабатывает multipart/form-data запрос и загружает фото
 * В development режиме сохраняет в папку uploads/photos/[subfolder]
 * В production режиме загружает в Supabase Storage в bucket/[subfolder]
 *
 * @param req - Fastify request объект
 * @param allowedFileFields - массив допустимых имён полей для файлов
 * @param maxFileSize - максимальный размер файла в байтах (по умолчанию 500KB)
 * @param subfolder - подпапка для сохранения файлов (например, 'progress', 'users'). Если не указана, сохраняет в корень
 * @returns объект с текстовыми полями и URL загруженных файлов
 *
 * @example
 * // Сохранение в корень (по умолчанию)
 * const result = await uploadPhotos(req)
 * // Файлы: /uploads/photos/filename.jpg
 *
 * @example
 * // Сохранение в подпапку 'progress'
 * const result = await uploadPhotos(req, ['photoFront', 'photoSide', 'photoBack'], MAX_PHOTO_SIZE, 'progress')
 * // Файлы: /uploads/photos/progress/filename.jpg
 */
export async function uploadPhotos(
	req: FastifyRequest,
	allowedFileFields: string[] = ['photoFront', 'photoSide', 'photoBack'],
	maxFileSize: number = MAX_PHOTO_SIZE,
	subfolder?: string,
): Promise<UploadResult> {
	if (!req.isMultipart()) {
		throw ApiError.badRequest('Ожидается multipart/form-data')
	}

	const body: Record<string, string> = {}
	const files: Record<string, string> = {}
	const uploadedPaths: string[] = [] // Для отката при ошибке

	try {
		for await (const part of req.parts()) {
			if (part.type === 'file') {
				// Валидация размера файла
				const chunks: Buffer[] = []
				let totalSize = 0

				for await (const chunk of part.file) {
					totalSize += chunk.length
					if (totalSize > maxFileSize) {
						throw ApiError.badRequest(
							`Файл "${part.fieldname}" слишком большой. Максимальный размер ${
								maxFileSize / 1024
							}КБ`,
						)
					}
					chunks.push(chunk)
				}

				// Пропускаем пустые файлы
				if (totalSize === 0) {
					continue
				}

				// Проверяем допустимость поля
				if (!allowedFileFields.includes(part.fieldname)) {
					continue
				}

				const buffer = Buffer.concat(chunks)
				const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${
					part.filename
				}`

				if (isLocalStorage) {
					// Локальное хранение (development)
					const uploadsDir = subfolder
						? path.join(process.cwd(), 'uploads', 'photos', subfolder)
						: path.join(process.cwd(), 'uploads', 'photos')

					// Создаём директорию если не существует
					if (!fs.existsSync(uploadsDir)) {
						fs.mkdirSync(uploadsDir, { recursive: true })
					}

					const filePath = path.join(uploadsDir, filename)
					fs.writeFileSync(filePath, buffer)

					// Возвращаем относительный URL для доступа через static
					const urlPath = subfolder
						? `/uploads/photos/${subfolder}/${filename}`
						: `/uploads/photos/${filename}`
					files[part.fieldname] = urlPath
					uploadedPaths.push(filePath)
				} else {
					// Supabase Storage (production)
					const filePath = subfolder ? `${subfolder}/${filename}` : `${filename}`

					const { data, error } = await supabase!.storage
						.from(PHOTOS_BUCKET)
						.upload(filePath, buffer, {
							contentType: part.mimetype,
							upsert: false,
						})

					if (error) {
						throw ApiError.internal(
							`Ошибка загрузки файла "${part.fieldname}": ${error.message}`,
						)
					}

					// Получаем публичный URL
					const {
						data: { publicUrl },
					} = supabase!.storage.from(PHOTOS_BUCKET).getPublicUrl(data.path)

					files[part.fieldname] = publicUrl
					uploadedPaths.push(data.path)
				}
			} else {
				// Текстовое поле
				body[part.fieldname] = String(part.value)
			}
		}

		return { body, files }
	} catch (error) {
		// Откатываем загруженные файлы при ошибке
		if (uploadedPaths.length > 0) {
			if (isLocalStorage) {
				// Удаляем локальные файлы
				for (const filePath of uploadedPaths) {
					try {
						if (fs.existsSync(filePath)) {
							fs.unlinkSync(filePath)
						}
					} catch (e) {
						console.error(`Не удалось удалить файл: ${filePath}`, e)
					}
				}
			} else {
				// Удаляем из Supabase
				await supabase!.storage.from(PHOTOS_BUCKET).remove(uploadedPaths)
			}
		}
		throw error
	}
}

/**
 * Удаляет фото по URL (локально или из Supabase)
 * Поддерживает подпапки (например, /uploads/photos/progress/file.jpg)
 * @param photoUrl - URL фото
 */
export async function deletePhoto(photoUrl: string): Promise<void> {
	try {
		if (isLocalStorage) {
			// Локальное удаление
			// URL format: /uploads/photos/[subfolder]/filename.jpg или /uploads/photos/filename.jpg
			if (photoUrl.startsWith('/uploads/')) {
				const filePath = path.join(process.cwd(), photoUrl)
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath)
				}
			}
		} else {
			if (!supabase) {
				console.error('Supabase Storage не настроен')
				return
			}

			// Извлекаем путь файла из публичного URL
			// URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
			const urlParts = photoUrl.split(`/object/public/${PHOTOS_BUCKET}/`)
			if (urlParts.length !== 2) {
				console.error(`Неверный формат URL: ${photoUrl}`)
				return
			}

			const filePath = urlParts[1]

			const { error } = await supabase.storage.from(PHOTOS_BUCKET).remove([filePath])

			if (error) {
				console.error(`Не удалось удалить фото из Supabase: ${photoUrl}`, error)
			}
		}
	} catch (error) {
		console.error(`Ошибка при удалении фото: ${photoUrl}`, error)
	}
}

/**
 * Прикрепляет URL загруженных файлов к объекту request для возможной очистки при ошибке
 * @param req - Fastify request объект
 * @param filesMap - Объект с URL загруженных файлов
 */
export function attachFilesToRequest(
	req: FastifyRequest,
	filesMap: Record<string, string>,
): void {
	const uploadedFiles = Object.values(filesMap)
	Object.assign(req, { uploadedFiles })
}

/**
 * Проверяет наличие всех обязательных фотографий
 * @param filesMap - Объект с путями к загруженным файлам
 * @param requiredFields - Массив имён обязательных полей
 * @throws {ApiError} Если отсутствует хотя бы одна обязательная фотография
 */
export function validateRequiredPhotos(
	filesMap: Record<string, string>,
	requiredFields: string[],
): void {
	const missingPhotos = requiredFields.filter((field) => !filesMap[field])

	if (missingPhotos.length > 0) {
		throw ApiError.badRequest(
			`Все фотографии обязательны: ${requiredFields.join(
				', ',
			)}. Отсутствуют: ${missingPhotos.join(', ')}`,
		)
	}
}

/**
 * Fastify onError хук для автоматической очистки загруженных файлов при ошибке
 * Использование: { onError: cleanupFilesOnError }
 */
export async function cleanupFilesOnError(
	request: FastifyRequest,
	reply: any,
	error: Error,
): Promise<void> {
	const uploadedFiles = (request as any).uploadedFiles as string[] | undefined
	if (uploadedFiles && uploadedFiles.length > 0) {
		await Promise.all(uploadedFiles.map((fileUrl) => deletePhoto(fileUrl)))
	}
}
