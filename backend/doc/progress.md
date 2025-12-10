# Progress API - Документация

API для управления отчетами о прогрессе и комментариями тренера.

**Base URL:** `/api/progress`

**Структура загрузки фото:**

- Фото прогресса сохраняются в `uploads/photos/progress/`
- Максимальный размер каждого фото: 500KB
- Требуется 3 фото: спереди, сбоку, сзади
- Поддерживаемые форматы: JPG, PNG, WebP

---

## Оглавление

- [Получение последнего отчета](#получение-последнего-отчета)
- [Создание нового отчета](#создание-нового-отчета)
- [Получение всех отчетов](#получение-всех-отчетов)
- [Получение отчета по ID](#получение-отчета-по-id)
- [Получение комментариев к отчету](#получение-комментариев-к-отчету)
- [Добавление комментария](#добавление-комментария)
- [Получение аналитики прогресса](#получение-аналитики-прогресса)
- [Сравнение параметров прогресса](#сравнение-параметров-прогресса)

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

Получает все отчеты о прогрессе пользователя с комментариями, пагинацией и фильтрацией по датам. Клиент получает свои отчеты, тренер - отчеты клиентов, которые у него в работе.

**Endpoint:** `GET /api/progress`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Query параметры

| Параметр  | Тип    | Обязательное     | По умолчанию | Описание                                 |
| --------- | ------ | ---------------- | ------------ | ---------------------------------------- |
| page      | number | ❌               | 1            | Номер страницы (минимум 1)               |
| limit     | number | ❌               | 5            | Количество элементов на странице (1-100) |
| startDate | string | ❌               | -            | Начальная дата фильтра (ДД/ММ/ГГГГ)      |
| endDate   | string | ❌               | -            | Конечная дата фильтра (ДД/ММ/ГГГГ)       |
| clientId  | string | ❌ (для TRAINER) | -            | ID клиента (только для тренеров)         |

### Примеры запросов

**Клиент получает свои отчеты (базовый запрос, первая страница, 5 элементов):**

```
GET /api/progress
```

**Клиент с пагинацией:**

```
GET /api/progress?page=2&limit=10
```

**Клиент с фильтрацией по датам:**

```
GET /api/progress?startDate=01/11/2025&endDate=06/12/2025
```

**Клиент с пагинацией и фильтрацией:**

```
GET /api/progress?page=1&limit=5&startDate=01/11/2025&endDate=06/12/2025
```

**Тренер получает отчеты клиента:**

```
GET /api/progress?clientId=cm4client123
```

**Тренер получает отчеты клиента с пагинацией:**

```
GET /api/progress?clientId=cm4client123&page=2&limit=10
```

### Успешный ответ (200 OK)

```json
{
	"data": [
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
	],
	"meta": {
		"page": 1,
		"limit": 5,
		"total": 15,
		"totalPages": 3
	}
}
```

### Примечания

- Возвращается только `photoFront` (первое фото) для оптимизации списка
- Отчеты сортируются по дате в порядке убывания (новые первыми)
- Дата фильтрации применяется включительно с началом дня для `startDate` и концом дня для `endDate`

### Ошибки

- **400 Bad Request** - Невалидные параметры запроса (некорректный формат даты, отрицательные значения и т.д.)
- **400 Bad Request** - Тренер должен указать clientId в query параметрах
- **403 Forbidden** - У вас нет доступа к отчетам этого клиента

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

## Получение аналитики прогресса

Получает агрегированные данные прогресса для построения графиков.

**Endpoint:** `GET /api/progress/analytics`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Параметры запроса (Query)

| Параметр  | Тип    | Обязательное     | Значения по умолчанию | Описание                                              |
| --------- | ------ | ---------------- | --------------------- | ----------------------------------------------------- |
| period    | string | ❌               | `month`               | Период: `month`, `year`, `custom`                     |
| metrics   | string | ❌               | `weight,waist,hips`   | Метрики через запятую                                 |
| startDate | string | ❌               | -                     | Начало периода (ДД/ММ/ГГГГ), обязательно для `custom` |
| endDate   | string | ❌               | -                     | Конец периода (ДД/ММ/ГГГГ), обязательно для `custom`  |
| clientId  | string | ❌ (для TRAINER) | -                     | ID клиента (только для тренеров)                      |

**Доступные метрики:**

- `weight` - вес
- `waist` - обхват талии
- `hips` - обхват бедер
- `height` - рост
- `chest` - обхват груди
- `arm` - обхват руки
- `leg` - обхват ноги

### Примеры запросов

**Клиент запрашивает данные за месяц:**

```
GET /api/progress/analytics?period=month&metrics=weight,waist
```

**Тренер запрашивает данные клиента за год:**

```
GET /api/progress/analytics?period=year&metrics=weight,waist,hips&clientId=cm4client123
```

**Произвольный период:**

```
GET /api/progress/analytics?period=custom&startDate=01/01/2025&endDate=31/03/2025&metrics=weight
```

### Успешный ответ (200 OK)

```json
{
	"period": "month",
	"dateRange": {
		"from": "2025-11-06",
		"to": "2025-12-06"
	},
	"metrics": [
		{
			"metric": "weight",
			"data": [
				{
					"date": "2025-11-10",
					"value": 78.5
				},
				{
					"date": "2025-11-17",
					"value": 77.8
				},
				{
					"date": "2025-11-24",
					"value": 77.2
				},
				{
					"date": "2025-12-01",
					"value": 76.5
				}
			],
			"min": 76.5,
			"max": 78.5,
			"avg": 77.5,
			"change": -2.0
		},
		{
			"metric": "waist",
			"data": [
				{
					"date": "2025-11-10",
					"value": 85
				},
				{
					"date": "2025-11-17",
					"value": 84
				},
				{
					"date": "2025-11-24",
					"value": 83
				},
				{
					"date": "2025-12-01",
					"value": 82
				}
			],
			"min": 82.0,
			"max": 85.0,
			"avg": 83.5,
			"change": -3.0
		}
	]
}
```

### Описание полей ответа

- **period** - выбранный период
- **dateRange** - диапазон дат в формате YYYY-MM-DD
- **metrics** - массив данных по каждой метрике:
  - **metric** - название метрики
  - **data** - массив точек данных (дата + значение)
  - **min** - минимальное значение за период
  - **max** - максимальное значение за период
  - **avg** - среднее значение за период (округлено до 1 знака)
  - **change** - изменение от первого до последнего измерения (отрицательное = снижение)

### Ошибки

- **400 Bad Request** - Некорректные параметры запроса
- **400 Bad Request** - Для периода "custom" необходимо указать startDate и endDate
- **400 Bad Request** - Дата окончания должна быть позже или равна дате начала
- **400 Bad Request** - Тренер должен указать clientId в query параметрах
- **401 Unauthorized** - Не авторизован
- **403 Forbidden** - Недостаточно прав доступа

---

## Сравнение параметров прогресса

Сравнивает начальные и текущие параметры с расчетом изменений в абсолютных значениях и процентах.

**Endpoint:** `GET /api/progress/compare`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Параметры запроса (Query)

| Параметр      | Тип    | Обязательное     | Описание                                                 |
| ------------- | ------ | ---------------- | -------------------------------------------------------- |
| startReportId | string | ❌               | ID начального отчета (если не указан - берется первый)   |
| endReportId   | string | ❌               | ID конечного отчета (если не указан - берется последний) |
| clientId      | string | ❌ (для TRAINER) | ID клиента (только для тренеров)                         |

### Примеры запросов

**Клиент сравнивает первый и последний отчеты:**

```
GET /api/progress/compare
```

**Клиент сравнивает конкретные отчеты:**

```
GET /api/progress/compare?startReportId=cm4report1&endReportId=cm4report2
```

**Тренер сравнивает данные клиента:**

```
GET /api/progress/compare?clientId=cm4client123
```

### Успешный ответ (200 OK)

```json
{
	"startReport": {
		"id": "cm4report1",
		"date": "2025-09-01",
		"photoFront": "/uploads/photos/front-1.jpg",
		"photoSide": "/uploads/photos/side-1.jpg",
		"photoBack": "/uploads/photos/back-1.jpg"
	},
	"endReport": {
		"id": "cm4report20",
		"date": "2025-12-06",
		"photoFront": "/uploads/photos/front-20.jpg",
		"photoSide": "/uploads/photos/side-20.jpg",
		"photoBack": "/uploads/photos/back-20.jpg"
	},
	"daysBetween": 96,
	"comparisons": [
		{
			"metric": "weight",
			"start": 85.0,
			"end": 78.5,
			"change": {
				"absolute": -6.5,
				"percentage": -7.6
			},
			"improved": true
		},
		{
			"metric": "height",
			"start": 180,
			"end": 180,
			"change": {
				"absolute": 0,
				"percentage": 0
			},
			"improved": null
		},
		{
			"metric": "chest",
			"start": 105,
			"end": 102,
			"change": {
				"absolute": -3,
				"percentage": -2.9
			},
			"improved": true
		},
		{
			"metric": "waist",
			"start": 95,
			"end": 82,
			"change": {
				"absolute": -13,
				"percentage": -13.7
			},
			"improved": true
		},
		{
			"metric": "hips",
			"start": 105,
			"end": 98,
			"change": {
				"absolute": -7,
				"percentage": -6.7
			},
			"improved": true
		},
		{
			"metric": "arm",
			"start": 38,
			"end": 36,
			"change": {
				"absolute": -2,
				"percentage": -5.3
			},
			"improved": true
		},
		{
			"metric": "leg",
			"start": 62,
			"end": 58,
			"change": {
				"absolute": -4,
				"percentage": -6.5
			},
			"improved": true
		}
	],
	"summary": {
		"totalMetricsChanged": 6,
		"improvedMetrics": 6,
		"worsenedMetrics": 0,
		"unchangedMetrics": 1
	}
}
```

### Описание полей ответа

**startReport / endReport:**

- **id** - ID отчета
- **date** - дата отчета (YYYY-MM-DD)
- **photoFront/Side/Back** - пути к фотографиям

**daysBetween** - количество дней между отчетами

**comparisons** - массив сравнений по каждой метрике:

- **metric** - название метрики (weight, height, chest, waist, hips, arm, leg)
- **start** - начальное значение
- **end** - конечное значение
- **change**:
  - **absolute** - абсолютное изменение (округлено до 1 знака)
  - **percentage** - изменение в процентах (округлено до 1 знака)
- **improved** - оценка изменения:
  - `true` - улучшение (уменьшение веса/обхватов)
  - `false` - ухудшение (увеличение)
  - `null` - не оценивается (рост) или без изменений

**summary** - сводная статистика:

- **totalMetricsChanged** - количество метрик с изменениями
- **improvedMetrics** - количество улучшенных метрик
- **worsenedMetrics** - количество ухудшенных метрик
- **unchangedMetrics** - количество метрик без изменений

### Логика оценки улучшений

- **Вес, обхваты (waist, hips, chest, arm, leg)**: уменьшение = улучшение ✅
- **Рост (height)**: не оценивается как улучшение/ухудшение
- Если значение не изменилось или отсутствует: `improved = null`

### Ошибки

- **400 Bad Request** - Некорректный ID отчета
- **400 Bad Request** - Нельзя сравнивать отчет с самим собой
- **400 Bad Request** - Тренер должен указать clientId в query параметрах
- **404 Not Found** - Начальный или конечный отчет не найден
- **404 Not Found** - Недостаточно данных для сравнения
- **401 Unauthorized** - Не авторизован
- **403 Forbidden** - Недостаточно прав доступа

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

---

## Примечания

### Фотографии отчетов

- **Обязательность:** При создании отчета требуются все 3 фото (спереди, сбоку, сзади)
- **Максимальный размер:** 500KB на файл
- **Форматы:** JPG, PNG
- **Хранение:**
  - Development: локальная папка `uploads/photos`
  - Production: Supabase Storage (публичные URL)

### Формат даты

- В запросе: `ДД/ММ/ГГГГ` (например, `03/12/2025`)
- В ответе: ISO 8601 (`2025-12-03T00:00:00.000Z`)

### Уникальность отчетов

- Один пользователь может создать только **один отчет за день**
- При попытке создать дубликат возвращается ошибка `400 Bad Request`

### Комментарии

- Комментарии могут оставлять только **тренеры**
- Тренер может комментировать отчеты только **своих клиентов**
- Клиент видит все комментарии к своим отчетам
