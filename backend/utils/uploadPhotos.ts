import { FastifyRequest } from 'fastify'
import fs from 'fs'
import path from 'path'
import { ApiError } from './ApiError.js'
import { MAX_PHOTO_SIZE } from 'consts/file.js'

const __dirname = path.resolve()
const UPLOAD_DIR = path.join(__dirname, './uploads/photos')

// Создаём директорию для загрузок, если её нет
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

interface UploadResult {
	body: Record<string, string>
	files: Record<string, string>
}

/**
 * Обрабатывает multipart/form-data запрос и сохраняет фото
 * @param req - Fastify request объект
 * @param allowedFileFields - массив допустимых имён полей для файлов
 * @param maxFileSize - максимальный размер файла в байтах (по умолчанию 500KB)
 * @returns объект с текстовыми полями и путями к сохранённым файлам
 */
export async function uploadPhotos(
	req: FastifyRequest,
	allowedFileFields: string[] = ['photoFront', 'photoSide', 'photoBack'],
	maxFileSize: number = MAX_PHOTO_SIZE,
): Promise<UploadResult> {
	if (!req.isMultipart()) {
		throw ApiError.badRequest('Ожидается multipart/form-data')
	}

	const body: Record<string, string> = {}
	const files: Record<string, string> = {}

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

			// Сохранение файла
			const buffer = Buffer.concat(chunks)
			const filename = `${Date.now()}-${part.filename}`
			const filepath = path.join(UPLOAD_DIR, filename)
			fs.writeFileSync(filepath, buffer)

			// Добавляем путь к файлу, если поле разрешено
			if (allowedFileFields.includes(part.fieldname)) {
				files[part.fieldname] = `/uploads/photos/${filename}`
			}
		} else {
			// Текстовое поле
			body[part.fieldname] = String(part.value)
		}
	}

	return { body, files }
}

/**
 * Удаляет фото по указанному пути
 * @param photoPath - путь к фото (например, '/uploads/photos/123456-photo.jpg')
 */
export function deletePhoto(photoPath: string): void {
	try {
		const fullPath = path.join(__dirname, photoPath)
		if (fs.existsSync(fullPath)) {
			fs.unlinkSync(fullPath)
		}
	} catch (error) {
		console.error(`Failed to delete photo: ${photoPath}`, error)
	}
}

/**
 * Прикрепляет пути загруженных файлов к объекту request для возможной очистки при ошибке
 * @param req - Fastify request объект
 * @param filesMap - Объект с путями к загруженным файлам
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
		uploadedFiles.forEach((filePath) => deletePhoto(filePath))
	}
}
