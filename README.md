<div align="center">

# 💪 FitnessApp

### Платформа для персонализированного фитнес-коучинга

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Связь между тренерами и клиентами • Персональные планы питания • Отслеживание прогресса**

</div>

---

## 📖 О проекте

**FitnessApp** — это платформа-посредник между фитнес-тренерами и их клиентами. Система позволяет тренерам создавать индивидуальные программы питания и контролировать прогресс клиентов в режиме реального времени.

<table>
<tr>
<td width="50%">

### 🎯 Для тренеров
- Управление базой клиентов
- Создание планов питания по категориям
- Отслеживание прогресса с комментариями
- Система приглашений и избранных клиентов

</td>
<td width="50%">

### 👤 Для клиентов
- Персональные планы питания
- Фиксация антропометрических данных
- Фото-отчёты прогресса
- Прямая связь с тренером через чат

</td>
</tr>
</table>

---

## ✨ Ключевые возможности

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   📊 ПРОГРЕСС           🍽️ ПИТАНИЕ            💬 КОММУНИКАЦИЯ              │
│   ─────────────         ──────────            ───────────────               │
│   • Вес, объёмы         • Категории           • Real-time чат               │
│   • Фото front/side/    • Подкатегории        • Комментарии                 │
│     back                • Дни и приёмы        • Система                     │
│   • Графики динамики    • Цикличность           приглашений                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Архитектура

```
┌──────────────────────────────────────────────────────────────────┐
│                         КЛИЕНТ (Browser)                         │
│                    React + Redux Toolkit + Ant Design            │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTP / WebSocket
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                         СЕРВЕР (Backend)                         │
│                      Fastify + Socket.IO + Zod                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │ Prisma ORM
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      БАЗА ДАННЫХ (PostgreSQL)                    │
│                           + Supabase Storage                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Технологический стек

<table>
<tr>
<th align="center">Frontend</th>
<th align="center">Backend</th>
<th align="center">Инфраструктура</th>
</tr>
<tr>
<td valign="top">

| Технология | Назначение |
|:-----------|:-----------|
| React 18 | UI библиотека |
| TypeScript | Типизация |
| Redux Toolkit | State management |
| Ant Design | UI компоненты |
| Tailwind CSS | Стилизация |
| Vite | Сборка |
| Recharts | Графики |
| Socket.IO Client | Real-time |

</td>
<td valign="top">

| Технология | Назначение |
|:-----------|:-----------|
| Node.js | Runtime |
| Fastify | HTTP сервер |
| Prisma | ORM |
| Socket.IO | WebSocket |
| Zod | Валидация |
| JWT | Авторизация |
| bcrypt | Хеширование |
| Vitest | Тестирование |

</td>
<td valign="top">

| Технология | Назначение |
|:-----------|:-----------|
| PostgreSQL | База данных |
| Supabase | Файловое хранилище |
| Docker | Контейнеризация |
| Nginx | Reverse proxy |

</td>
</tr>
</table>

---

## 📁 Структура проекта

```
diplom-middle-fitnessApp/
├── 📂 backend/
│   ├── 📂 controllers/      # Обработчики запросов
│   ├── 📂 middleware/       # Auth guards, error handlers
│   ├── 📂 prisma/           # Схема БД и миграции
│   ├── 📂 routes/           # API маршруты
│   ├── 📂 services/         # Бизнес-логика
│   ├── 📂 validation/       # Zod схемы
│   └── 📂 tests/            # Unit тесты
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/   # React компоненты
│   │   ├── 📂 pages/        # Страницы (auth, client, trainer)
│   │   ├── 📂 store/        # Redux store и API слайсы
│   │   ├── 📂 router/       # Маршрутизация
│   │   └── 📂 utils/        # Утилиты
│   └── 📄 vite.config.ts
│
└── 📂 doc/                  # Документация проекта
```

---

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 20+
- PostgreSQL 15+
- npm или yarn

### Установка

```bash
# 1. Клонирование репозитория
git clone <repository-url>
cd diplom-middle-fitnessApp

# 2. Установка зависимостей
cd backend && npm install
cd ../frontend && npm install

# 3. Настройка переменных окружения
# Создайте .env файлы в backend/ и frontend/ по примерам .env.example

# 4. Инициализация базы данных
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed        # Полный сид с тестовыми данными
# или
npm run prisma:seed:light  # Минимальный сид

# 5. Запуск в режиме разработки
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Docker

```bash
# Запуск через Docker Compose
docker-compose up -d
```

---

## 📚 Документация

| Документ | Описание |
|:---------|:---------|
| [📋 Процесс разработки](./doc/DEVELOPMENT.md) | Workflow, ветки, коммиты |
| [🔍 Процесс ревью](./doc/REVIEW_PROCESS.md) | Code review guidelines |
| [🔄 CI/CD Pipeline](./doc/CI_CD.md) | Автоматизация деплоя |
| [🔐 Настройка секретов](./.github/SECRETS.md) | GitHub Secrets |
| [📦 Redux Store](./frontend/src/store/README.md) | Полная документация по Store |

### API документация

| Модуль | Описание |
|:-------|:---------|
| [🔑 Auth](./backend/doc/auth.md) | Регистрация, авторизация |
| [👤 User](./backend/doc/user.md) | Профиль пользователя |
| [🏋️ Trainer](./backend/doc/trainer.md) | Функционал тренера |
| [📈 Progress](./backend/doc/progress.md) | Отчёты прогресса |
| [🍽️ Nutrition](./backend/doc/nutrition.md) | Планы питания |
| [💬 Chat](./backend/doc/chat.md) | Система сообщений |

---

## 🔐 Роли и доступ

```
┌─────────────┬──────────────────────────────────────────────────────────────┐
│    РОЛЬ     │                        ВОЗМОЖНОСТИ                          │
├─────────────┼──────────────────────────────────────────────────────────────┤
│   CLIENT    │ • Просмотр назначенных планов питания                       │
│             │ • Создание отчётов прогресса (измерения + фото)             │
│             │ • Отправка приглашений тренерам                             │
│             │ • Чат с тренером                                            │
├─────────────┼──────────────────────────────────────────────────────────────┤
│   TRAINER   │ • Управление клиентской базой                               │
│             │ • Создание категорий и планов питания                       │
│             │ • Назначение планов клиентам                                │
│             │ • Просмотр прогресса клиентов + комментарии                 │
│             │ • Приём/отклонение приглашений                              │
└─────────────┴──────────────────────────────────────────────────────────────┘
```

---


## 🧑‍💻 Команда разработки

<table>
<tr>
<th>Роль</th>
<th>Имя</th>
<th>Контакт</th>
<th>Часов/нед</th>
<th>Примечания</th>
</tr>
<tr>
<td>👑 <b>Team Lead</b></td>
<td>Дмитрий Колесников</td>
<td><a href="https://t.me/falsesolution">@falsesolution</a></td>
<td align="center">35-40</td>
<td>Работа 2/2, в рабочие дни без созвонов</td>
</tr>
<tr>
<td>💻 Разработчик</td>
<td>Дмитрий Колотуша</td>
<td><a href="https://t.me/SuvStreet">@SuvStreet</a></td>
<td align="center">35-40</td>
<td>—</td>
</tr>
<tr>
<td>💻 Разработчик</td>
<td>Ибрагимова Анастасия</td>
<td><a href="https://t.me/IbragimovaNast">@IbragimovaNast</a></td>
<td align="center">5-10</td>
<td>—</td>
</tr>
<tr>
<td>💻 Разработчик</td>
<td>Терентьев Виталий</td>
<td><a href="https://t.me/kami_vy">@kami_vy</a></td>
<td align="center">15-20</td>
<td>—</td>
</tr>
<tr>
<td>💻 Разработчик</td>
<td>Старикова Мария</td>
<td><a href="https://t.me/SStarikovaMaria">@SStarikovaMaria</a></td>
<td align="center">5-10</td>
<td>—</td>
</tr>
</table>

### 📬 Коммуникация

- **Основной чат:** [Telegram группа](https://t.me/c/3311239734/1)
- **Код-ревью:** Все PR должны быть одобрены минимум одним участником команды

---

## 📜 Лицензия

Проект разработан в рамках дипломной работы.

---

<div align="center">

**Сделано с ❤️ командой FitnessApp**

</div>
