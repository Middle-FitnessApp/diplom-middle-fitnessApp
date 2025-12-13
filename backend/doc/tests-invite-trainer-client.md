1. Скачать зависимости:

## npm install

2. Создать тестовую БД в pgAdmin fitness_test;

3. Применить миграции к тестовой БД:

## npx dotenv -e .env.test -- npx prisma migrate deploy

4. Сгенерировать Prisma Client:

## npx prisma generate

5. Создать .env.test в корне проекта (пример):

DATABASE_URL="postgresql://postgres:password@localhost:5432/fitness_test"
PORT=3000
DIRECT_URL="postgresql://postgres:password@localhost:5432/fitness_test"
JWT_ACCESS_SECRET="test_jwt_secret_for_integration_tests"
COOKIE_SECRET="test_cookie_secret_12345"
NODE_ENV="test"
FRONTEND_URL="http://localhost:5173"

6. Запуск тестов:

- Все тесты

## npm test tests/invites-trainer-client

- Один тест

## npm test tests/invites-trainer-client/send-invite.test.ts

- В режиме watch

## npm test tests/invites-trainer-client -- --watch
