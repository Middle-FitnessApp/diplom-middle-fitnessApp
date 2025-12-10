# ============================================
# Frontend Dockerfile - Multi-stage Build
# ============================================
# Этот файл описывает как собрать Docker образ
# для React приложения

# ═══════════════════════════════════════════
# Stage 1: Build (сборка приложения)
# ═══════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей отдельно (для кеширования)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь исходный код
COPY . .

# Переменная для API URL (передается при сборке)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Собираем production версию
RUN npm run build

# ═══════════════════════════════════════════
# Stage 2: Production (раздача через nginx)
# ═══════════════════════════════════════════
FROM nginx:alpine

# Копируем собранное приложение в nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Nginx запускается автоматически
CMD ["nginx", "-g", "daemon off;"]

