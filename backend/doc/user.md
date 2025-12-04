# User API - Документация

API для управления профилями пользователей (клиентов и тренеров).

**Base URL:** `/api/user`

---

## Оглавление

- [Получение информации о себе](#получение-информации-о-себе)
- [Обновление профиля клиента](#обновление-профиля-клиента)
- [Обновление профиля тренера](#обновление-профиля-тренера)

---

## Получение информации о себе

Получает полную информацию о текущем авторизованном пользователе.

**Endpoint:** `GET /api/user/me`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Успешный ответ (200 OK)

**Для клиента:**

```json
{
	"user": {
		"id": "cm4abc123def456",
		"name": "Иван Петров",
		"email": "ivan@example.com",
		"phone": "+79991234567",
		"photo": "/uploads/photos/user-photo.jpg",
		"age": 25,
		"role": "CLIENT",
		"goal": "Похудение",
		"restrictions": "Проблемы с коленями",
		"experience": "Новичок",
		"diet": "Без ограничений",
		"photoFront": "/uploads/photos/front-abc123.jpg",
		"photoSide": "/uploads/photos/side-abc123.jpg",
		"photoBack": "/uploads/photos/back-abc123.jpg",
		"createdAt": "2025-11-20T10:30:00.000Z",
		"updatedAt": "2025-12-03T10:30:00.000Z"
	}
}
```

**Для тренера:**

```json
{
	"user": {
		"id": "cm4xyz789ghi012",
		"name": "Алексей Смирнов",
		"email": "alex@example.com",
		"phone": "+79997654321",
		"photo": "/uploads/photos/trainer-photo.jpg",
		"age": 30,
		"role": "TRAINER",
		"telegram": "@alextrainer",
		"whatsapp": "+79997654321",
		"instagram": "alex_fitness",
		"bio": "Сертифицированный тренер с 10-летним опытом",
		"createdAt": "2025-10-15T08:00:00.000Z",
		"updatedAt": "2025-12-01T15:00:00.000Z"
	}
}
```

### Описание полей ответа

**Общие поля:**

- `id` - уникальный идентификатор
- `name` - имя пользователя
- `email` - email (если указан)
- `phone` - телефон (если указан)
- `photo` - основное фото профиля
- `age` - возраст
- `role` - роль (`CLIENT` или `TRAINER`)
- `createdAt` - дата регистрации
- `updatedAt` - дата последнего обновления

**Поля клиента (CLIENT):**

- `goal` - цель тренировок
- `restrictions` - ограничения по здоровью
- `experience` - опыт тренировок
- `diet` - особенности питания
- `photoFront` - фото спереди
- `photoSide` - фото сбоку
- `photoBack` - фото сзади

**Поля тренера (TRAINER):**

- `telegram` - username в Telegram
- `whatsapp` - номер WhatsApp
- `instagram` - username в Instagram
- `bio` - биография

### Ошибки

- **401 Unauthorized** - Отсутствует или недействителен access token
- **404 Not Found** - Пользователь не найден

---

## Обновление профиля клиента

Обновляет данные профиля клиента.

**Endpoint:** `PUT /api/user/client/profile`

**Права доступа:** `CLIENT`

**Content-Type:** `multipart/form-data` (если загружается фото) или `application/json`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Параметры запроса

| Поле         | Тип    | Обязательное | Описание                            |
| ------------ | ------ | ------------ | ----------------------------------- |
| name         | string | ❌           | Имя пользователя                    |
| email        | string | ❌           | Email (уникальный)                  |
| phone        | string | ❌           | Телефон в формате +7XXXXXXXXXX      |
| age          | number | ❌           | Возраст                             |
| photo        | file   | ❌           | Основное фото профиля (макс. 500KB) |
| goal         | string | ❌           | Цель тренировок                     |
| restrictions | string | ❌           | Ограничения по здоровью             |
| experience   | string | ❌           | Опыт тренировок                     |
| diet         | string | ❌           | Особенности питания                 |

### Примеры запросов

**Обновление с фото (multipart/form-data):**

```bash
curl -X PUT http://localhost:3000/api/user/client/profile \
  -H "Authorization: Bearer <access_token>" \
  -F "name=Иван Петров Обновленный" \
  -F "age=26" \
  -F "goal=Набор мышечной массы" \
  -F "photo=@new-photo.jpg"
```

**Обновление без фото (application/json):**

```json
{
	"name": "Иван Петров",
	"age": 26,
	"goal": "Набор мышечной массы",
	"experience": "Средний уровень"
}
```

### Успешный ответ (200 OK)

```json
{
	"message": "Профиль клиента успешно обновлён",
	"user": {
		"id": "cm4abc123def456",
		"name": "Иван Петров",
		"email": "ivan@example.com",
		"phone": "+79991234567",
		"photo": "/uploads/photos/new-photo.jpg",
		"age": 26,
		"role": "CLIENT",
		"goal": "Набор мышечной массы",
		"restrictions": "Проблемы с коленями",
		"experience": "Средний уровень",
		"diet": "Без ограничений",
		"photoFront": "/uploads/photos/front-abc123.jpg",
		"photoSide": "/uploads/photos/side-abc123.jpg",
		"photoBack": "/uploads/photos/back-abc123.jpg",
		"createdAt": "2025-11-20T10:30:00.000Z",
		"updatedAt": "2025-12-03T14:20:00.000Z"
	}
}
```

### Ошибки

- **400 Bad Request** - Некорректные данные
- **401 Unauthorized** - Отсутствует или недействителен access token
- **403 Forbidden** - Доступ только для клиентов
- **409 Conflict** - Email или телефон уже используется другим пользователем
- **400 Bad Request** - Файл фото превышает 500KB

---

## Обновление профиля тренера

Обновляет данные профиля тренера.

**Endpoint:** `PUT /api/user/trainer/profile`

**Права доступа:** `TRAINER`

**Content-Type:** `multipart/form-data` (если загружается фото) или `application/json`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Параметры запроса

| Поле      | Тип    | Обязательное | Описание                            |
| --------- | ------ | ------------ | ----------------------------------- |
| name      | string | ❌           | Имя тренера                         |
| email     | string | ❌           | Email (уникальный)                  |
| phone     | string | ❌           | Телефон в формате +7XXXXXXXXXX      |
| age       | number | ❌           | Возраст                             |
| photo     | file   | ❌           | Основное фото профиля (макс. 500KB) |
| telegram  | string | ❌           | Username в Telegram                 |
| whatsapp  | string | ❌           | Номер WhatsApp                      |
| instagram | string | ❌           | Username в Instagram                |
| bio       | string | ❌           | Биография тренера                   |

### Примеры запросов

**Обновление с фото (multipart/form-data):**

```bash
curl -X PUT http://localhost:3000/api/user/trainer/profile \
  -H "Authorization: Bearer <access_token>" \
  -F "name=Алексей Смирнов" \
  -F "bio=Сертифицированный тренер с 12-летним опытом" \
  -F "photo=@new-trainer-photo.jpg"
```

**Обновление без фото (application/json):**

```json
{
	"name": "Алексей Смирнов",
	"bio": "Сертифицированный тренер с 12-летним опытом",
	"instagram": "alex_pro_fitness",
	"telegram": "@alextrainer_updated"
}
```

### Успешный ответ (200 OK)

```json
{
	"message": "Профиль тренера успешно обновлён",
	"user": {
		"id": "cm4xyz789ghi012",
		"name": "Алексей Смирнов",
		"email": "alex@example.com",
		"phone": "+79997654321",
		"photo": "/uploads/photos/new-trainer-photo.jpg",
		"age": 30,
		"role": "TRAINER",
		"telegram": "@alextrainer_updated",
		"whatsapp": "+79997654321",
		"instagram": "alex_pro_fitness",
		"bio": "Сертифицированный тренер с 12-летним опытом",
		"createdAt": "2025-10-15T08:00:00.000Z",
		"updatedAt": "2025-12-03T16:45:00.000Z"
	}
}
```

### Ошибки

- **400 Bad Request** - Некорректные данные
- **401 Unauthorized** - Отсутствует или недействителен access token
- **403 Forbidden** - Доступ только для тренеров
- **409 Conflict** - Email или телефон уже используется другим пользователем
- **400 Bad Request** - Файл фото превышает 500KB

---

## Примечания

### Фотографии

- **Основное фото профиля** (`photo`) - можно обновить для обеих ролей
- **Регистрационные фото** (`photoFront`, `photoSide`, `photoBack`) - только для клиентов, устанавливаются при регистрации и **не обновляются** через этот API
- **Максимальный размер:** 500KB
- **Форматы:** JPG, PNG
- **Хранение:** Supabase Storage

### Контактные данные

- Email и телефон должны быть уникальными в системе
- При обновлении происходит проверка на конфликт с другими пользователями
- Формат телефона: `+7XXXXXXXXXX` (11 цифр с кодом страны)
- Email проверяется на корректность формата

### Обновление полей

- Все поля опциональны - можно обновить только нужные
- Поля, которые не переданы в запросе, остаются без изменений
- Пустая строка `""` не удаляет значение, а игнорируется
- Для удаления значения необходимо передать `null` (только в JSON)

### Content-Type

- Используйте `multipart/form-data` если загружаете фото
- Используйте `application/json` если обновляете только текстовые поля
- При использовании `multipart/form-data` числовые поля передаются как строки и автоматически конвертируются
