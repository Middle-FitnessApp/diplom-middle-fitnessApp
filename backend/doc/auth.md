# Auth API - Документация

API для аутентификации и управления сессиями пользователей.

**Base URL:** `/api/auth`

---

## Оглавление

- [Регистрация пользователя](#регистрация-пользователя)
- [Вход в систему](#вход-в-систему)
- [Обновление токена](#обновление-токена)
- [Выход из системы](#выход-из-системы)

---

## Регистрация пользователя

Создает нового пользователя (клиента или тренера) в системе.

**Endpoint:** `POST /api/auth/signup`

**Права доступа:** `PUBLIC`

**Query параметры:**

| Параметр | Тип    | По умолчанию | Описание                  |
| -------- | ------ | ------------ | ------------------------- |
| role     | string | CLIENT       | Роль: `CLIENT`, `TRAINER` |

### Регистрация клиента (CLIENT)

**Content-Type:** `multipart/form-data`

**Параметры запроса:**

| Поле         | Тип    | Обязательное | Описание                       |
| ------------ | ------ | ------------ | ------------------------------ |
| name         | string | ✅           | Имя пользователя               |
| email        | string | ✅\*         | Email (уникальный)             |
| phone        | string | ✅\*         | Телефон в формате +7XXXXXXXXXX |
| password     | string | ✅           | Пароль (мин. 6 символов)       |
| age          | number | ✅           | Возраст                        |
| photoFront   | file   | ✅           | Фото спереди (макс. 500KB)     |
| photoSide    | file   | ✅           | Фото сбоку (макс. 500KB)       |
| photoBack    | file   | ✅           | Фото сзади (макс. 500KB)       |
| goal         | string | ❌           | Цель тренировок                |
| restrictions | string | ❌           | Ограничения по здоровью        |
| experience   | string | ❌           | Опыт тренировок                |
| diet         | string | ❌           | Особенности питания            |

_\*Требуется либо email, либо phone (или оба)_

### Регистрация тренера (TRAINER)

**Content-Type:** `application/json`

**Параметры запроса:**

| Поле      | Тип    | Обязательное | Описание                       |
| --------- | ------ | ------------ | ------------------------------ |
| name      | string | ✅           | Имя тренера                    |
| email     | string | ✅\*         | Email (уникальный)             |
| phone     | string | ✅\*         | Телефон в формате +7XXXXXXXXXX |
| password  | string | ✅           | Пароль (мин. 6 символов)       |
| age       | number | ✅           | Возраст                        |
| telegram  | string | ❌           | Username в Telegram            |
| whatsapp  | string | ❌           | Номер WhatsApp                 |
| instagram | string | ❌           | Username в Instagram           |
| bio       | string | ❌           | Биография тренера              |

_\*Требуется либо email, либо phone (или оба)_

### Примеры запросов

**Регистрация клиента:**

```bash
# Используя curl
curl -X POST http://localhost:3000/api/auth/signup?role=CLIENT \
  -F "name=Иван Петров" \
  -F "email=ivan@example.com" \
  -F "phone=+79991234567" \
  -F "password=myPassword123" \
  -F "age=25" \
  -F "goal=Похудение" \
  -F "photoFront=@front.jpg" \
  -F "photoSide=@side.jpg" \
  -F "photoBack=@back.jpg"
```

**Регистрация тренера:**

```bash
# Используя curl
curl -X POST http://localhost:3000/api/auth/signup?role=TRAINER \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Алексей Смирнов",
    "email": "alex@example.com",
    "phone": "+79991234567",
    "password": "trainerPass123",
    "age": 30,
    "bio": "Сертифицированный тренер с 10-летним опытом",
    "telegram": "@alextrainer",
    "instagram": "alex_fitness"
  }'
```

### Успешный ответ (201 Created)

```json
{
	"user": {
		"id": "cm4abc123def456",
		"name": "Иван Петров",
		"email": "ivan@example.com",
		"phone": "+79991234567",
		"photo": "/uploads/default/user.png",
		"age": 25,
		"role": "CLIENT",
		"createdAt": "2025-12-03T10:30:00.000Z",
		"updatedAt": "2025-12-03T10:30:00.000Z"
	},
	"token": {
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```

### Описание полей ответа

**user** - данные созданного пользователя:

- `id` - уникальный идентификатор
- `name` - имя пользователя
- `email` - email (если указан)
- `phone` - телефон (если указан)
- `photo` - путь к фото профиля
- `age` - возраст
- `role` - роль (`CLIENT` или `TRAINER`)
- `createdAt` - дата создания
- `updatedAt` - дата последнего обновления

**token** - токены доступа:

- `accessToken` - JWT токен для API запросов (время жизни: 15 минут)

**Refresh token** устанавливается автоматически в httpOnly cookie (время жизни: 30 дней)

### Ошибки

- **400 Bad Request** - Некорректные данные, недостающие поля
- **409 Conflict** - Email или телефон уже зарегистрирован
- **400 Bad Request** - Файлы фото превышают 500KB

---

## Вход в систему

Аутентификация пользователя по email/телефону и паролю.

**Endpoint:** `POST /api/auth/login`

**Права доступа:** `PUBLIC`

**Content-Type:** `application/json`

**Параметры запроса:**

| Поле     | Тип    | Обязательное | Описание                         |
| -------- | ------ | ------------ | -------------------------------- |
| contact  | string | ✅           | Email или телефон (+7XXXXXXXXXX) |
| password | string | ✅           | Пароль                           |

### Примеры запросов

**Вход по email:**

```json
{
	"contact": "ivan@example.com",
	"password": "mySecurePassword123"
}
```

**Вход по телефону:**

```json
{
	"contact": "+79991234567",
	"password": "mySecurePassword123"
}
```

### Успешный ответ (200 OK)

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
		"createdAt": "2025-11-20T10:30:00.000Z",
		"updatedAt": "2025-12-03T10:30:00.000Z"
	},
	"token": {
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```

### Ошибки

- **400 Bad Request** - Неверный формат контакта или отсутствует пароль
- **401 Unauthorized** - Неверный email/телефон или пароль
- **404 Not Found** - Пользователь не найден

---

## Обновление токена

Обновление access токена с использованием refresh token из cookie.

**Endpoint:** `POST /api/auth/refresh`

**Права доступа:** `PUBLIC` (требуется refresh token в cookie)

**Headers:**

```
Cookie: refreshToken=<refresh_token>
```

### Успешный ответ (200 OK)

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
		"createdAt": "2025-11-20T10:30:00.000Z",
		"updatedAt": "2025-12-03T10:30:00.000Z"
	},
	"token": {
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```

### Описание

При успешном запросе:

1. Валидируется refresh token из cookie
2. Генерируется новый access token
3. Обновляется refresh token в cookie
4. Возвращаются актуальные данные пользователя

### Ошибки

- **401 Unauthorized** - Отсутствует refresh token в cookie
- **401 Unauthorized** - Refresh token недействителен или истек
- **404 Not Found** - Пользователь не найден

---

## Выход из системы

Удаление refresh token и завершение сессии.

**Endpoint:** `POST /api/auth/logout`

**Права доступа:** `CLIENT`, `TRAINER` (требуется авторизация)

**Headers:**

```
Authorization: Bearer <access_token>
```

### Успешный ответ (200 OK)

```json
{
	"message": "Успешный выход"
}
```

### Описание

При успешном запросе:

1. Удаляется refresh token из cookie
2. Access token становится недействительным
3. Пользователь должен войти заново для получения новых токенов

### Ошибки

- **401 Unauthorized** - Отсутствует или недействителен access token

---

## Токены

### Access Token

- **Тип:** JWT (JSON Web Token)
- **Время жизни:** 15 минут
- **Использование:** Передается в заголовке `Authorization: Bearer <token>`
- **Содержит:** userId, role

### Refresh Token

- **Тип:** JWT (JSON Web Token)
- **Время жизни:** 30 дней
- **Хранение:** httpOnly cookie (защита от XSS)
- **Использование:** Автоматически отправляется браузером

---

## Примечания

### Безопасность

- Пароли хешируются с использованием bcrypt
- Refresh token хранится в httpOnly cookie (недоступен для JavaScript)
- Access token имеет короткое время жизни для минимизации рисков
- Email и телефон должны быть уникальными в системе

### Фотографии

- **Для клиентов:** обязательно 3 фото при регистрации (спереди, сбоку, сзади)
- **Для тренеров:** фото не требуется при регистрации
- **Максимальный размер:** 500KB на файл
- **Форматы:** JPG, PNG
- **Хранение:** Supabase Storage

### Контактные данные

- Требуется хотя бы один способ связи: email или телефон
- Формат телефона: `+7XXXXXXXXXX` (11 цифр с кодом страны)
- Email проверяется на корректность формата
- При входе можно использовать любой из указанных контактов
