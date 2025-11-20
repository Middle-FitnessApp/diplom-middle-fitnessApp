# Fitness Backend

Backend для проекта онлайн-фитнеса на Fastify + TypeScript + Prisma + PostgreSQL.

## Установка зависимостей

```bash
npm install
```

Создаем .env файл в корне и указываем переменные:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME

# Пример:
#
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fitnessApp

PORT=3000
JWT_ACCESS_SECRET="обратитесь к администратору для получения секрета"
```

## Настройка базы данных
Убедитесь, что у вас установлен [pgAdmin 4](https://www.pgadmin.org/download/) и запущен PostgreSQL. Создайте базу данных с именем `fitnessApp`.

Для первого запуска проекта (если вы только что клонировали репозиторий):

```bash
npm run prisma:generate       # генерируем клиент Prisma
npm run prisma:migrate        # создаём миграции и применяем их
```

Для последующих запусков проекта (если миграции уже созданы):

```bash
npm run prisma:migrate:dev    # применяет новые миграции
npm run prisma:generate       # обновляет Prisma Client
```

⚠️ Если локальная база содержит конфликтные данные, можно сбросить её:

```bash
npm run prisma:reset          # сбрасывает базу данных и применяет миграции заново
```

## Запуск сервера

```bash
npm run dev
```

Сервер будет доступен по адресу: `http://localhost:3000`

----------

## Рекомендации для команды

- ⚠️ Не создавайте новую миграцию без необходимости.

Для новых изменений схемы используйте:

```bash
npm run prisma:migrate:name -- <описание>
```

Всегда запускайте `npm run prisma:generate` после изменений схемы.
