# 🚀 DEPLOY.md - Руководство по развёртыванию

## 📖 Содержание

- [Предварительные требования](#-предварительные-требования)
- [Быстрый старт](#-быстрый-старт)
- [Подробная инструкция](#-подробная-инструкция)
- [Переменные окружения](#-переменные-окружения)
- [Первичный запуск](#-первичный-запуск)
- [Обновление версии](#-обновление-версии)
- [Настройка SSL](#-настройка-ssl)
- [Troubleshooting](#-troubleshooting)

---

## ✅ Предварительные требования

### Обязательные

- **Docker** 20.10+ и **Docker Compose** 2.0+
- **PostgreSQL** 15+ (локально или удалённо)
- **Домен** с настроенным DNS (для SSL)
- **VPS/Сервер** с минимум 2GB RAM, 2 CPU cores

### Опциональные

- **Supabase** аккаунт (для хранения файлов)
- **Git** (для клонирования репозитория)

### Проверка установки

```bash
# Проверка Docker
docker --version
docker-compose --version

# Проверка подключения к БД (если локальная)
psql --version
```

---

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd diplom-middle-fitnessApp
```

### 2. Настройка переменных окружения

```bash
# Копируем пример
cp env.example .env

# Редактируем файл
nano .env  # или vim .env
```

**Минимально необходимые переменные:**

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
COOKIE_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=https://your-domain.ru
```

### 3. Запуск приложения

```bash
# Запуск всех сервисов
docker-compose -f docker-compose.prod.yml up -d

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps
```

### 4. Проверка работоспособности

```bash
# Health check backend
curl http://localhost/health

# Health check frontend
curl http://localhost/

# Health check nginx
curl http://localhost/health
```

---

## 📋 Подробная инструкция

### Шаг 1: Подготовка сервера

#### 1.1. Установка Docker

**Ubuntu/Debian:**

```bash
# Обновление пакетов
sudo apt update && sudo apt upgrade -y

# Установка зависимостей
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Добавление официального GPG ключа Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавление репозитория
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Проверка установки
sudo docker --version
sudo docker compose version
```

**CentOS/RHEL:**

```bash
# Установка зависимостей
sudo yum install -y yum-utils

# Добавление репозитория
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Установка Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Запуск Docker
sudo systemctl start docker
sudo systemctl enable docker

# Проверка
sudo docker --version
```

#### 1.2. Настройка firewall

```bash
# Открытие портов
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Включение firewall
sudo ufw enable
sudo ufw status
```

#### 1.3. Создание директорий

```bash
# Создание рабочей директории
mkdir -p /opt/fitness-app
cd /opt/fitness-app

# Клонирование репозитория
git clone <repository-url> .
```

---

### Шаг 2: Настройка базы данных

#### Вариант A: Внешняя БД (Supabase, AWS RDS, и т.д.)

1. Создайте базу данных в вашем провайдере
2. Получите connection string
3. Добавьте в `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
DIRECT_URL=postgresql://user:password@host:5432/database
```

#### Вариант B: Локальная БД через Docker

1. Добавьте переменные в `.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=fitnessapp
DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/fitnessapp
DIRECT_URL=postgresql://postgres:your_secure_password@postgres:5432/fitnessapp
```

2. Запустите с профилем `with-db`:

```bash
docker-compose -f docker-compose.prod.yml --profile with-db up -d postgres
```

---

### Шаг 3: Настройка переменных окружения

#### 3.1. Генерация секретных ключей

```bash
# Генерация JWT секрета
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Генерация Cookie секрета
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3.2. Заполнение `.env`

Откройте `env.example` и скопируйте все переменные в `.env`, заполнив значения:

```bash
cp env.example .env
nano .env
```

**Обязательные переменные:**

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_ACCESS_SECRET` | Секрет для JWT (мин. 32 символа) | `abc123...` |
| `COOKIE_SECRET` | Секрет для cookies (мин. 32 символа) | `xyz789...` |
| `FRONTEND_URL` | URL фронтенда (для CORS) | `https://your-domain.ru` |
| `NODE_ENV` | Режим работы | `production` |

**Опциональные переменные:**

| Переменная | Описание | Когда использовать |
|------------|----------|-------------------|
| `VITE_API_URL` | URL API для фронтенда | Если API на другом домене |
| `SUPABASE_URL` | URL проекта Supabase | Для хранения файлов в облаке |
| `SUPABASE_ANON_KEY` | Публичный ключ Supabase | Для хранения файлов в облаке |
| `SUPABASE_SERVICE_KEY` | Сервисный ключ Supabase | Для хранения файлов в облаке |

---

### Шаг 4: Первичный запуск

#### 4.1. Запуск контейнеров

```bash
# Запуск всех сервисов
docker-compose -f docker-compose.prod.yml up -d

# Просмотр логов (в реальном времени)
docker-compose -f docker-compose.prod.yml logs -f

# Просмотр логов конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f backend
```

#### 4.2. Проверка миграций

Миграции запускаются автоматически при старте backend. Проверьте логи:

```bash
docker-compose -f docker-compose.prod.yml logs backend | grep -i migrate
```

Должно быть сообщение: `✅ Migrations applied successfully`

#### 4.3. Заполнение тестовыми данными (опционально)

```bash
# Вход в контейнер backend
docker-compose -f docker-compose.prod.yml exec backend sh

# Внутри контейнера:
npm run prisma:seed        # Полный seed с тестовыми данными
# или
npm run prisma:seed:light  # Минимальный seed
```

#### 4.4. Проверка работоспособности

```bash
# Backend health check
curl http://localhost/health
# Ожидаемый ответ: {"status":"ok"}

# Frontend доступность
curl -I http://localhost/
# Ожидаемый ответ: HTTP/1.1 200 OK

# Проверка API
curl http://localhost/api/auth/health
```

---

### Шаг 5: Настройка DNS

1. Зайдите в панель управления вашего домена
2. Добавьте A-запись:

```
Тип: A
Имя: @ (или www)
Значение: IP_ВАШЕГО_СЕРВЕРА
TTL: 3600
```

3. Подождите распространения DNS (5-60 минут)

4. Проверка:

```bash
# Проверка DNS
nslookup your-domain.ru
dig your-domain.ru
```

---

### Шаг 6: Настройка SSL (Let's Encrypt)

#### 6.1. Подготовка

Убедитесь, что:
- ✅ Домен указывает на ваш сервер
- ✅ Порты 80 и 443 открыты
- ✅ Nginx запущен и доступен

#### 6.2. Получение сертификата

```bash
# Остановка nginx (временно)
docker-compose -f docker-compose.prod.yml stop nginx

# Получение сертификата
docker run -it --rm \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d your-domain.ru \
  -d www.your-domain.ru

# Запуск nginx обратно
docker-compose -f docker-compose.prod.yml start nginx
```

#### 6.3. Настройка Nginx для HTTPS

1. Отредактируйте `nginx/conf.d/default.conf`:

```nginx
# Раскомментируйте HTTPS сервер блок
server {
    listen 443 ssl http2;
    server_name your-domain.ru;

    ssl_certificate /etc/letsencrypt/live/your-domain.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.ru/privkey.pem;
    
    # ... остальная конфигурация
}
```

2. Раскомментируйте редирект HTTP → HTTPS в HTTP блоке:

```nginx
location / {
    return 301 https://$host$request_uri;
}
```

3. Перезапустите nginx:

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

#### 6.4. Автоматическое обновление сертификатов

Certbot контейнер автоматически обновляет сертификаты каждые 12 часов. Проверка:

```bash
# Проверка статуса certbot
docker-compose -f docker-compose.prod.yml logs certbot

# Ручное обновление (если нужно)
docker-compose -f docker-compose.prod.yml exec certbot certbot renew
```

---

## 🔄 Обновление версии

### Автоматическое обновление (через CI/CD)

Если настроен CI/CD pipeline (см. `doc/CI_CD.md`), обновление происходит автоматически при мерже в `development`.

### Ручное обновление

#### 1. Остановка старых контейнеров

```bash
cd /opt/fitness-app
docker-compose -f docker-compose.prod.yml down
```

#### 2. Обновление кода

```bash
# Получение последних изменений
git pull origin development

# Или для конкретной ветки
git checkout main
git pull origin main
```

#### 3. Пересборка образов

```bash
# Пересборка всех сервисов
docker-compose -f docker-compose.prod.yml build --no-cache

# Или только конкретного сервиса
docker-compose -f docker-compose.prod.yml build --no-cache backend
```

#### 4. Запуск новых контейнеров

```bash
# Запуск с пересозданием
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps
```

#### 5. Проверка миграций

```bash
# Просмотр логов миграций
docker-compose -f docker-compose.prod.yml logs backend | grep -i migrate

# Если миграции не применились автоматически
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

#### 6. Очистка старых образов

```bash
# Удаление неиспользуемых образов
docker image prune -a

# Удаление неиспользуемых volumes
docker volume prune
```

---

## 🔧 Troubleshooting

### Проблема: Контейнеры не запускаются

**Симптомы:**
```bash
docker-compose ps
# Показывает статус "Restarting" или "Exited"
```

**Решение:**

1. Проверьте логи:
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs nginx
```

2. Проверьте переменные окружения:
```bash
docker-compose -f docker-compose.prod.yml config
```

3. Проверьте доступность БД:
```bash
docker-compose -f docker-compose.prod.yml exec backend sh
# Внутри контейнера:
npx prisma db pull
```

---

### Проблема: 502 Bad Gateway

**Симптомы:**
- Nginx возвращает 502 ошибку
- Backend недоступен

**Решение:**

1. Проверьте, запущен ли backend:
```bash
docker-compose -f docker-compose.prod.yml ps backend
```

2. Проверьте логи backend:
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

3. Проверьте health endpoint:
```bash
curl http://localhost/health
# Должен вернуть {"status":"ok"}
```

4. Проверьте сеть Docker:
```bash
docker network ls
docker network inspect diplom-middle-fitnessapp_fitness-network
```

---

### Проблема: Миграции не применяются

**Симптомы:**
- Ошибки в логах: `Migration failed`
- Приложение не может подключиться к БД

**Решение:**

1. Проверьте connection string:
```bash
docker-compose -f docker-compose.prod.yml exec backend printenv DATABASE_URL
```

2. Примените миграции вручную:
```bash
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

3. Проверьте статус миграций:
```bash
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status
```

---

### Проблема: Frontend не подключается к API

**Симптомы:**
- CORS ошибки в браузере
- API запросы не проходят

**Решение:**

1. Проверьте `FRONTEND_URL` в `.env`:
```bash
grep FRONTEND_URL .env
# Должен совпадать с реальным доменом
```

2. Проверьте `VITE_API_URL` (если используется):
```bash
grep VITE_API_URL .env
# Должен быть пустым или указывать на правильный домен
```

3. Пересоберите frontend с правильными переменными:
```bash
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

---

### Проблема: SSL сертификат не обновляется

**Симптомы:**
- Предупреждения о просроченном сертификате
- Certbot не обновляет сертификаты

**Решение:**

1. Проверьте логи certbot:
```bash
docker-compose -f docker-compose.prod.yml logs certbot
```

2. Обновите сертификат вручную:
```bash
docker-compose -f docker-compose.prod.yml exec certbot certbot renew --force-renewal
```

3. Перезапустите nginx:
```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

---

### Проблема: Высокое использование памяти

**Симптомы:**
- Сервер тормозит
- Контейнеры перезапускаются

**Решение:**

1. Проверьте использование ресурсов:
```bash
docker stats
```

2. Ограничьте ресурсы в `docker-compose.prod.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

3. Очистите неиспользуемые ресурсы:
```bash
docker system prune -a --volumes
```

---

### Проблема: Файлы не загружаются

**Симптомы:**
- Ошибки при загрузке фото
- Файлы не сохраняются

**Решение:**

1. Если используете Supabase:
   - Проверьте переменные `SUPABASE_*` в `.env`
   - Проверьте права доступа к бакетам в Supabase

2. Если используете локальное хранилище:
   - Проверьте права на директорию:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend ls -la /app/uploads
   ```
   - Проверьте volume:
   ```bash
   docker volume inspect diplom-middle-fitnessapp_uploads_data
   ```

---

## 📊 Мониторинг и логи

### Просмотр логов

```bash
# Все сервисы
docker-compose -f docker-compose.prod.yml logs -f

# Конкретный сервис
docker-compose -f docker-compose.prod.yml logs -f backend

# Последние 100 строк
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Мониторинг ресурсов

```bash
# Использование ресурсов в реальном времени
docker stats

# Использование диска
docker system df
```

### Health checks

```bash
# Backend
curl http://localhost/health

# Frontend
curl -I http://localhost/

# Nginx
curl http://localhost/health
```

---

## 🔐 Безопасность

### Рекомендации

1. **Секретные ключи:**
   - Никогда не коммитьте `.env` в репозиторий
   - Используйте длинные случайные ключи (минимум 32 символа)
   - Регулярно обновляйте секреты

2. **Firewall:**
   - Откройте только необходимые порты (80, 443, 22)
   - Используйте fail2ban для защиты от брутфорса

3. **SSL:**
   - Всегда используйте HTTPS в production
   - Настройте автоматическое обновление сертификатов

4. **База данных:**
   - Используйте сильные пароли
   - Ограничьте доступ по IP
   - Регулярно делайте бэкапы

5. **Docker:**
   - Регулярно обновляйте образы
   - Используйте непривилегированных пользователей в контейнерах
   - Ограничьте ресурсы контейнеров

---

## 📚 Полезные команды

### Управление контейнерами

```bash
# Запуск
docker-compose -f docker-compose.prod.yml up -d

# Остановка
docker-compose -f docker-compose.prod.yml stop

# Остановка и удаление
docker-compose -f docker-compose.prod.yml down

# Перезапуск
docker-compose -f docker-compose.prod.yml restart

# Перезапуск конкретного сервиса
docker-compose -f docker-compose.prod.yml restart backend
```

### Работа с БД

```bash
# Вход в контейнер backend
docker-compose -f docker-compose.prod.yml exec backend sh

# Применение миграций
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed данных
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:seed

# Prisma Studio (GUI для БД)
docker-compose -f docker-compose.prod.yml exec backend npx prisma studio
# Откройте http://localhost:5555
```

### Очистка

```bash
# Удаление остановленных контейнеров
docker container prune

# Удаление неиспользуемых образов
docker image prune -a

# Полная очистка (осторожно!)
docker system prune -a --volumes
```

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте раздел [Troubleshooting](#-troubleshooting)
3. Создайте issue в репозитории с описанием проблемы

---

## 📝 История изменений

| Дата | Автор | Изменения |
|------|-------|-----------|
| 10.12.2025 | Колесников Дмитрий | Создание документации по деплою |

