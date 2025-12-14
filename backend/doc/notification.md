# Notification API - Документация

API для управления уведомлениями пользователей.

**Base URL:** `/api/notifications`

---

## Оглавление

- [Получение уведомлений](#получение-уведомлений)
- [Отметка уведомления как прочитанного](#отметка-уведомления-как-прочитанного)
- [Отметка всех уведомлений как прочитанные](#отметка-всех-уведомлений-как-прочитанные)
- [Получение количества непрочитанных уведомлений](#получение-количества-непрочитанных-уведомлений)

---

## Получение уведомлений

Получает список уведомлений пользователя с пагинацией.

**Endpoint:** `GET /api/notifications`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query параметры:**

- `page` (number, optional): Номер страницы (по умолчанию 1)
- `limit` (number, optional): Количество уведомлений на странице (по умолчанию 10, максимум 50)

### Успешный ответ (200 OK)

```json
{
	"notifications": [
		{
			"id": "cmj0ekqha000zvoacptmktcpw",
			"type": "REPORT",
			"message": "Ваш клиент отправил новый отчет о прогрессе",
			"isRead": false,
			"createdAt": "2025-12-14T12:00:00.000Z"
		}
	],
	"pagination": {
		"page": 1,
		"limit": 10,
		"total": 25,
		"totalPages": 3
	}
}
```

---

## Отметка уведомления как прочитанного

Отмечает конкретное уведомление как прочитанное.

**Endpoint:** `PATCH /api/notifications/:id/read`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Path параметры:**

- `id` (string): ID уведомления

### Успешный ответ (200 OK)

```json
{
	"message": "Уведомление отмечено как прочитанное",
	"notification": {
		"id": "cmj0ekqha000zvoacptmktcpw",
		"type": "REPORT",
		"message": "Ваш клиент отправил новый отчет о прогрессе",
		"isRead": true,
		"createdAt": "2025-12-14T12:00:00.000Z"
	}
}
```

---

## Отметка всех уведомлений как прочитанные

Отмечает все уведомления пользователя как прочитанные.

**Endpoint:** `PATCH /api/notifications/mark-all-read`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Успешный ответ (200 OK)

```json
{
	"message": "Отмечено 5 уведомлений как прочитанные",
	"updatedCount": 5
}
```

---

## Получение количества непрочитанных уведомлений

Возвращает количество непрочитанных уведомлений пользователя.

**Endpoint:** `GET /api/notifications/unread-count`

**Права доступа:** `CLIENT`, `TRAINER`

**Headers:**

```
Authorization: Bearer <access_token>
```

### Успешный ответ (200 OK)

```json
{
	"unreadCount": 3
}
```

---

## Типы уведомлений

- `REPORT` - Новый отчет о прогрессе от клиента
- `INVITE_ACCEPTED` - Приглашение тренеру принято клиентом
- `INVITE_REJECTED` - Приглашение тренеру отклонено клиентом
- `CHAT_MESSAGE` - Новое сообщение в чате
