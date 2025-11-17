# Fitness Backend

Backend для проекта онлайн-фитнеса на Fastify + TypeScript + Prisma + PostgreSQL.

## Установка зависимостей

```bash
npm install
```

Создаем .env файл в корне и указываем переменные:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME

#	Например:
#
# USER=postgres
# PASSWORD=yourpassword
# HOST=localhost
# PORT=5432
# DATABASE_NAME=fitnessApp
# Database URL будет выглядеть так:
#
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fitnessApp

PORT=3000
```

## Настройка базы данных
Убедитесь, что у вас установлен [pgAdmin 4](https://www.pgadmin.org/download/) и запущен PostgreSQL. Создайте базу данных с именем `fitnessApp`.

Генерируем Prisma Client и создаем миграции:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Запуск сервера

```bash
npm run dev
```
