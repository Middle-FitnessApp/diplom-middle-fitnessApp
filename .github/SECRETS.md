# 🔐 GitHub Secrets - Настройка CI/CD

## Как добавить секреты

1. GitHub → твой репозиторий
2. **Settings** → **Secrets and variables** → **Actions**
3. Нажми **"New repository secret"**
4. Добавь каждый секрет из списка ниже

---

## 📋 Необходимые секреты

| Секрет | Описание | Пример |
|--------|----------|--------|
| `DOCKER_USERNAME` | Логин на Docker Hub | `myusername` |
| `DOCKER_PASSWORD` | Access Token от Docker Hub | `dckr_pat_xxxxx` |
| `TIMEWEB_HOST` | IP адрес VPS | `123.45.67.89` |
| `TIMEWEB_SSH_KEY` | Приватный SSH ключ (весь файл) | `-----BEGIN OPENSSH...` |
| `API_URL` | URL бэкенда для фронтенда | `https://api.fitness-app.ru` |

---

## 🔑 Как получить Docker Hub Access Token

1. Зайди на [hub.docker.com](https://hub.docker.com)
2. Account Settings → Security → New Access Token
3. Скопируй токен в секрет `DOCKER_PASSWORD`

---

## 🔑 Как создать SSH ключ

```bash
# Генерация ключа
ssh-keygen -t ed25519 -C "github-actions" -f github-deploy-key

# Добавь публичный ключ на сервер
cat github-deploy-key.pub >> ~/.ssh/authorized_keys

# Приватный ключ добавь в секрет TIMEWEB_SSH_KEY
cat github-deploy-key
```

---

## 📁 Файл на сервере

На VPS должен быть файл `/root/fitness-backend.env`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db
JWT_ACCESS_SECRET=your-secret-key-32-chars
COOKIE_SECRET=another-secret-key
NODE_ENV=production
FRONTEND_URL=https://fitness-app.ru
```

---

## ✅ Чек-лист

- [ ] `DOCKER_USERNAME` добавлен
- [ ] `DOCKER_PASSWORD` добавлен  
- [ ] `TIMEWEB_HOST` добавлен
- [ ] `TIMEWEB_SSH_KEY` добавлен
- [ ] `API_URL` добавлен
- [ ] `/root/fitness-backend.env` создан на сервере
