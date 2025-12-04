# Progress API - Документация

API для управления отчетами о прогрессе и комментариями тренера.

**Base URL:** `/api/progress`

---

## Оглавление

- [Получение последнего отчета](#получение-последнего-отчета)
- [Создание нового отчета](#создание-нового-отчета)
- [Получение всех отчетов](#получение-всех-отчетов)
- [Получение отчета по ID](#получение-отчета-по-id)
- [Получение комментариев к отчету](#получение-комментариев-к-отчету)
- [Добавление комментария](#добавление-комментария)

---

## Получение последнего отчета

Получает последний отчет о прогрессе для текущего пользователя.

**Endpoint:** `GET /api/progress/latest`

**Права доступа:** `CLIENT`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Успешный ответ (200 OK)

```json
{
	"progress": {
		"id": "cm4abc123def456",
		"date": "2025-12-03T00:00:00.000Z",
		"weight": 75.5,
		"height": 180,
		"chest": 98,
		"waist": 85,
		"hips": 95,
		"arm": 35,
		"leg": 58,
		"photoFront": "/uploads/photos/front-abc123.jpg",
		"photoSide": "/uploads/photos/side-abc123.jpg",
		"photoBack": "/uploads/photos/back-abc123.jpg",
		"createdAt": "2025-12-03T10:30:00.000Z",
		"updatedAt": "2025-12-03T10:30:00.000Z"
	}
}
```

### Ошибки

- **404 Not Found** - Отчеты о прогрессе не найдены

---

## Создание нового отчета

Создает новый отчет о прогрессе с фотографиями.

**Endpoint:** `PUT /api/progress/new-report`

**Права доступа:** `CLIENT`

**Content-Type:** `multipart/form-data`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Параметры запроса

| Поле       | Тип    | Обязательное | Описание                         |
| ---------- | ------ | ------------ | -------------------------------- |
| date       | string | ✅           | Дата отчета в формате ДД/ММ/ГГГГ |
| weight     | number | ✅           | Вес (кг)                         |
| waist      | number | ✅           | Обхват талии (см)                |
| hips       | number | ✅           | Обхват бедер (см)                |
| height     | number | ❌           | Рост (см)                        |
| chest      | number | ❌           | Обхват груди (см)                |
| arm        | number | ❌           | Обхват руки (см)                 |
| leg        | number | ❌           | Обхват ноги (см)                 |
| photoFront | file   | ✅           | Фото спереди                     |
| photoSide  | file   | ✅           | Фото сбоку                       |
| photoBack  | file   | ✅           | Фото сзади                       |

### Успешный ответ (201 Created)

```json
{
	"message": "Отчет о прогрессе успешно создан",
	"progress": {
		"id": "cm4abc123def456",
		"userId": "user123",
		"date": "2025-12-03T00:00:00.000Z",
		"weight": 75.5,
		"waist": 85,
		"hips": 95,
		"height": 180,
		"chest": 98,
		"arm": 35,
		"leg": 58,
		"photoFront": "/uploads/photos/front-abc123.jpg",
		"photoSide": "/uploads/photos/side-abc123.jpg",
		"photoBack": "/uploads/photos/back-abc123.jpg",
		"createdAt": "2025-12-03T10:30:00.000Z",
		"updatedAt": "2025-12-03T10:30:00.000Z"
	}
}
```

### Ошибки

- **400 Bad Request** - Отчет за эту дату уже существует
- **400 Bad Request** - Отсутствуют обязательные поля
- **400 Bad Request** - Некорректные данные

---

## Получение всех отчетов

Получает все отчеты о прогрессе текущего пользователя с комментариями.

**Endpoint:** `GET /api/progress`

**Права доступа:** `CLIENT`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Успешный ответ (200 OK)

```json
{
	"progress": [
		{
			"id": "cm4abc123",
			"date": "2025-12-03T00:00:00.000Z",
			"weight": 75.5,
			"height": 180,
			"chest": 98,
			"waist": 85,
			"hips": 95,
			"arm": 35,
			"leg": 58,
			"photoFront": "/uploads/photos/front-abc123.jpg",
			"photoSide": "/uploads/photos/side-abc123.jpg",
			"photoBack": "/uploads/photos/back-abc123.jpg",
			"createdAt": "2025-12-03T10:30:00.000Z",
			"updatedAt": "2025-12-03T10:30:00.000Z",
			"comments": [
				{
					"id": "comment123",
					"text": "Отличный прогресс!",
					"createdAt": "2025-12-03T15:00:00.000Z",
					"trainer": {
						"id": "trainer123",
						"name": "Иван Иванов",
						"photo": "/uploads/photos/trainer.jpg"
					}
				}
			]
		}
	]
}
```

---

## Получение отчета по ID

Получает конкретный отчет о прогрессе по его идентификатору.

**Endpoint:** `GET /api/progress/:id`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Параметры URL

| Параметр | Тип    | Описание         |
| -------- | ------ | ---------------- |
| id       | string | ID отчета (CUID) |

### Успешный ответ (200 OK)

```json
{
	"progress": {
		"id": "cm4abc123",
		"userId": "user123",
		"date": "2025-12-03T00:00:00.000Z",
		"weight": 75.5,
		"waist": 85,
		"hips": 95,
		"height": 180,
		"chest": 98,
		"arm": 35,
		"leg": 58,
		"photoFront": "/uploads/photos/front-abc123.jpg",
		"photoSide": "/uploads/photos/side-abc123.jpg",
		"photoBack": "/uploads/photos/back-abc123.jpg",
		"createdAt": "2025-12-03T10:30:00.000Z",
		"updatedAt": "2025-12-03T10:30:00.000Z",
		"user": {
			"id": "user123",
			"name": "Петр Петров",
			"photo": "/uploads/photos/user.jpg"
		}
	}
}
```

### Ошибки

- **400 Bad Request** - Некорректный формат ID отчета
- **404 Not Found** - Отчет о прогрессе не найден
- **403 Forbidden** - Нет доступа к этому отчету

---

## Получение комментариев к отчету

Получает комментарии к отчету о прогрессе с пагинацией и информацией о тренере.

**Endpoint:** `GET /api/progress/:id/comments`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Параметры URL

| Параметр | Тип    | Описание         |
| -------- | ------ | ---------------- |
| id       | string | ID отчета (CUID) |

### Параметры Query

| Параметр | Тип    | По умолчанию | Описание                                               |
| -------- | ------ | ------------ | ------------------------------------------------------ |
| page     | number | 1            | Номер страницы (min: 1)                                |
| limit    | number | 10           | Количество комментариев на странице (min: 1, max: 100) |

### Примеры запросов

```bash
# Первая страница (по умолчанию)
GET /api/progress/cm4abc123/comments

# Вторая страница
GET /api/progress/cm4abc123/comments?page=2

# 20 комментариев на странице
GET /api/progress/cm4abc123/comments?limit=20

# Третья страница, 15 комментариев
GET /api/progress/cm4abc123/comments?page=3&limit=15
```

### Успешный ответ (200 OK)

```json
{
	"comments": [
		{
			"id": "comment123",
			"text": "Отличный прогресс! Продолжай в том же духе.",
			"createdAt": "2025-12-03T15:30:00.000Z",
			"progressId": "cm4abc123",
			"trainerId": "trainer123",
			"trainer": {
				"id": "trainer123",
				"name": "Иван Иванов",
				"email": "ivan@example.com",
				"photo": "/uploads/photos/trainer.jpg"
			}
		},
		{
			"id": "comment124",
			"text": "Обрати внимание на технику выполнения упражнений.",
			"createdAt": "2025-12-02T10:15:00.000Z",
			"progressId": "cm4abc123",
			"trainerId": "trainer123",
			"trainer": {
				"id": "trainer123",
				"name": "Иван Иванов",
				"email": "ivan@example.com",
				"photo": "/uploads/photos/trainer.jpg"
			}
		}
	],
	"pagination": {
		"page": 1,
		"limit": 10,
		"total": 45,
		"totalPages": 5
	}
}
```

### Описание полей ответа

**comments** - массив комментариев:

- `id` - уникальный идентификатор комментария
- `text` - текст комментария
- `createdAt` - дата и время создания
- `progressId` - ID отчета, к которому относится комментарий
- `trainerId` - ID тренера, оставившего комментарий
- `trainer` - информация о тренере:
  - `id` - ID тренера
  - `name` - имя тренера
  - `email` - email тренера
  - `photo` - фото тренера

**pagination** - метаданные пагинации:

- `page` - текущая страница
- `limit` - количество элементов на странице
- `total` - общее количество комментариев
- `totalPages` - общее количество страниц

### Сортировка

Комментарии отсортированы по дате создания **по убыванию** (новые первыми).

### Ошибки

- **400 Bad Request** - Некорректный формат ID отчета
- **400 Bad Request** - Некорректные параметры пагинации
- **404 Not Found** - Отчет о прогрессе не найден

---

## Добавление комментария

Добавляет комментарий тренера к отчету о прогрессе.

**Endpoint:** `POST /api/progress/:id/comments`

**Права доступа:** `TRAINER`

**Content-Type:** `application/json`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Параметры URL

| Параметр | Тип    | Описание         |
| -------- | ------ | ---------------- |
| id       | string | ID отчета (CUID) |

### Тело запроса

```json
{
	"text": "Отличный прогресс! Продолжай в том же духе."
}
```

| Поле | Тип    | Обязательное | Описание                          |
| ---- | ------ | ------------ | --------------------------------- |
| text | string | ✅           | Текст комментария (min: 1 символ) |

### Успешный ответ (201 Created)

```json
{
	"message": "Комментарий успешно добавлен",
	"comment": {
		"id": "comment123",
		"text": "Отличный прогресс! Продолжай в том же духе.",
		"createdAt": "2025-12-03T15:30:00.000Z",
		"progressId": "cm4abc123",
		"trainerId": "trainer123",
		"trainer": {
			"id": "trainer123",
			"name": "Иван Иванов",
			"photo": "/uploads/photos/trainer.jpg"
		}
	}
}
```

### Ошибки

- **400 Bad Request** - Некорректный формат ID отчета
- **400 Bad Request** - Текст комментария обязателен
- **404 Not Found** - Отчет о прогрессе не найден

---

## Константы

Константы для пагинации определены в `backend/consts/pagination.ts`:

```typescript
DEFAULT_PAGE = 1 // Номер страницы по умолчанию
DEFAULT_LIMIT = 10 // Количество элементов по умолчанию
MIN_PAGE = 1 // Минимальный номер страницы
MIN_LIMIT = 1 // Минимальное количество элементов
MAX_LIMIT = 100 // Максимальное количество элементов
```

## Модели данных

### Progress (Отчет о прогрессе)

```typescript
{
  id: string              // CUID
  userId: string          // ID пользователя
  date: Date              // Дата отчета
  weight: number          // Вес (обязательно)
  waist: number           // Талия (обязательно)
  hips: number            // Бедра (обязательно)
  height?: number         // Рост (опционально)
  chest?: number          // Грудь (опционально)
  arm?: number            // Рука (опционально)
  leg?: number            // Нога (опционально)
  photoFront?: string     // Фото спереди
  photoSide?: string      // Фото сбоку
  photoBack?: string      // Фото сзади
  createdAt: Date         // Дата создания
  updatedAt: Date         // Дата обновления
}
```

### Comment (Комментарий)

```typescript
{
	id: string // CUID
	text: string // Текст комментария
	createdAt: Date // Дата создания
	progressId: string // ID отчета
	trainerId: string // ID тренера
}
```
