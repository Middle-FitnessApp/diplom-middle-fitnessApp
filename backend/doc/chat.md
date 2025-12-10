# Chat API - Документация

API для чата между тренерами и клиентами.

**Base URL:** `/api/chat`

**WebSocket URL:** `ws://localhost:3000` (или https для production)

**Структура загрузки изображений:**

- Изображения сообщений → `uploads/photos/chats/` (development) или Supabase Storage (production)
- Максимальный размер: 500KB
- Возвращаемый URL: полный URL (http://localhost:3000/uploads/... или https://domain.com/uploads/...)

---

## Оглавление

- [WebSocket подключение](#websocket-подключение)
- [Отправка сообщения](#отправка-сообщения)
- [Получение истории сообщений](#получение-истории-сообщений)
- [Получение списка чатов](#получение-списка-чатов)
- [События WebSocket](#события-websocket)

---

## WebSocket подключение

Устанавливает real-time соединение для чата.

**URL:** `ws://localhost:3000` (использует тот же порт, что и HTTP)

**Аутентификация:** Передайте токены в `handshake.auth`:

```javascript
const socket = io('ws://localhost:3000', {
	auth: {
		token: 'access_token_here',
		refreshToken: 'refresh_token_here',
	},
})
```

**Права доступа:** `CLIENT`, `TRAINER`

**Обработка ошибок:**

- `Токен отсутствует` - не передан token
- `Refresh токен отсутствует` - не передан refreshToken
- `Токены не связаны` - токены не соответствуют в БД
- `Пользователь не найден` - пользователь удален
- `Неверный токен` - токен истек или неверный

---

## Отправка сообщения

Отправляет сообщение в чат и рассылает через WebSocket. Если chatId не указан, автоматически создается новый чат между клиентом и его тренером.

**Endpoint:** `POST /api/chat/messages`

**Права доступа:** `CLIENT`, `TRAINER`

### Текстовое сообщение

**Content-Type:** `application/json`

**Тело запроса:**

```json
{
	"text": "Привет, как тренировка?",
	"chatId": "clz456def" // опционально, если не указан - создается новый чат
}
```

### Сообщение с изображением

**Content-Type:** `multipart/form-data`

**Тело запроса:**

| Поле   | Тип    | Обязательное | Описание                  |
| ------ | ------ | ------------ | ------------------------- |
| text   | string | ✅           | Текст сообщения           |
| image  | file   | ❌           | Изображение (макс. 500KB) |
| chatId | string | ❌           | ID чата (CUID)            |

**Пример ответа (200):**

```json
{
	"message": {
		"id": "clz123abc",
		"chatId": "clz456def",
		"senderId": "user123",
		"text": "Привет, как тренировка?",
		"imageUrl": "http://localhost:3000/uploads/photos/chats/filename.jpg",
		"createdAt": "2025-12-10T10:00:00.000Z",
		"isRead": false,
		"sender": {
			"id": "user123",
			"name": "Иван",
			"photo": "/uploads/default/user.png"
		}
	}
}
```

**Ошибки:**

- `400` - Пустой текст или неверные данные
- `403` - Вы не участник чата
- `404` - Чат не найден
- `400` - У клиента нет активного тренера (при создании нового чата)

---

## Получение истории сообщений

Получает сообщения чата с пагинацией. Автоматически отмечает входящие сообщения как прочитанные.

**Endpoint:** `GET /api/chat/:chatId/messages`

**Права доступа:** `CLIENT`, `TRAINER`

**Параметры пути:**

| Параметр | Тип    | Описание       |
| -------- | ------ | -------------- |
| chatId   | string | ID чата (CUID) |

**Query параметры:**

| Параметр | Тип    | По умолчанию | Описание                       |
| -------- | ------ | ------------ | ------------------------------ |
| page     | number | 1            | Номер страницы                 |
| limit    | number | 50           | Количество на страницу (1-100) |

**Пример ответа (200):**

```json
{
	"messages": [
		{
			"id": "clz123abc",
			"chatId": "clz456def",
			"senderId": "user123",
			"text": "Привет!",
			"imageUrl": "http://localhost:3000/uploads/photos/chats/filename.jpg",
			"createdAt": "2025-12-10T10:00:00.000Z",
			"isRead": true,
			"sender": {
				"id": "user123",
				"name": "Иван",
				"photo": "/uploads/default/user.png"
			}
		}
	],
	"pagination": {
		"page": 1,
		"limit": 50,
		"total": 1,
		"totalPages": 1
	}
}
```

**Ошибки:**

- `403` - Вы не участник чата
- `404` - Чат не найден

---

## Получение списка чатов

Получает список чатов пользователя с последним сообщением и счетчиком непрочитанных.

**Endpoint:** `GET /api/chat/`

**Права доступа:** `CLIENT`, `TRAINER`

**Пример ответа для тренера (200):**

```json
{
	"chats": [
		{
			"id": "clz456def",
			"trainerId": "trainer123",
			"clientId": "client456",
			"createdAt": "2025-12-01T09:00:00.000Z",
			"updatedAt": "2025-12-10T10:00:00.000Z",
			"client": {
				"id": "client456",
				"name": "Мария",
				"photo": "/uploads/photos/users/client456.jpg"
			},
			"lastMessage": {
				"id": "clz123abc",
				"chatId": "clz456def",
				"senderId": "client456",
				"text": "Спасибо за план!",
				"imageUrl": null,
				"createdAt": "2025-12-10T10:00:00.000Z",
				"isRead": false,
				"sender": {
					"id": "client456",
					"name": "Мария"
				}
			},
			"unreadCount": 2,
			"isFavorite": true
		}
	]
}
```

**Пример ответа для клиента (200):**

```json
{
	"chats": [
		{
			"id": "clz456def",
			"trainerId": "trainer123",
			"clientId": "client456",
			"createdAt": "2025-12-01T09:00:00.000Z",
			"updatedAt": "2025-12-10T10:00:00.000Z",
			"trainer": {
				"id": "trainer123",
				"name": "Алексей",
				"photo": "/uploads/photos/users/trainer123.jpg"
			},
			"lastMessage": {
				"id": "clz123abc",
				"chatId": "clz456def",
				"senderId": "trainer123",
				"text": "Как прошла тренировка?",
				"imageUrl": null,
				"createdAt": "2025-12-10T10:00:00.000Z",
				"isRead": false,
				"sender": {
					"id": "trainer123",
					"name": "Алексей"
				}
			},
			"unreadCount": 1
		}
	]
}
```

**Особенности:**

- Для тренера: чаты отсортированы по `isFavorite` (избранные клиенты сверху)
- `unreadCount`: количество непрочитанных сообщений от собеседника

---

## События WebSocket

### Подключение к чату

```javascript
socket.emit('join_chat', 'chatId')
```

### Отправка сообщения

```javascript
socket.emit('send_message', { chatId: 'chatId', text: 'Hello', image: file }) // image опционально
```

### Индикатор печати

```javascript
// Начать печатать
socket.emit('typing_start', 'chatId')

// Закончить печатать
socket.emit('typing_stop', 'chatId')
```

### Получение событий

```javascript
// Новое сообщение
socket.on('new_message', (message) => {
	console.log('Новое сообщение:', message)
})

// Пользователь печатает
socket.on('user_typing', ({ userId, chatId }) => {
	console.log(`Пользователь ${userId} печатает в чате ${chatId}`)
})

// Пользователь перестал печатать
socket.on('user_stopped_typing', ({ userId, chatId }) => {
	console.log(`Пользователь ${userId} перестал печатать в чате ${chatId}`)
})
```

**Примечание:** События `user_typing` и `user_stopped_typing` рассылаются только участникам комнаты чата, кроме отправителя.
