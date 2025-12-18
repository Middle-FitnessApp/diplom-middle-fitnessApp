# ============================================
# Common Proxy Configuration
# ============================================
# Включается в server блоки для унификации маршрутизации

# ═══════════════════════════════════════════
# API Backend (/api/*)
# ═══════════════════════════════════════════
location /api/ {
    # Rate limiting для API
    limit_req zone=api burst=50 nodelay;
    
    proxy_pass http://backend;
    proxy_http_version 1.1;
    
    # Передаём заголовки
    include /etc/nginx/conf.d/proxy-headers.conf;
    
    # Таймауты
    # proxy_connect_timeout 60s;
    # proxy_send_timeout 60s;
    # proxy_read_timeout 60s;
    
    # Буферизация
    # proxy_buffering on;
    # proxy_buffer_size 4k;
    # proxy_buffers 8 4k;
}

# ═══════════════════════════════════════════
# Авторизация (с усиленным rate limiting)
# ═══════════════════════════════════════════
location ^~ /api/auth/ {
    # Строгий rate limiting для защиты от брутфорса
    limit_req zone=auth burst=10 nodelay;
    
    proxy_pass http://backend;
    proxy_http_version 1.1;
    
    include /etc/nginx/conf.d/proxy-headers.conf;
}

# ═══════════════════════════════════════════
# WebSocket (Socket.IO)
# ═══════════════════════════════════════════
location /socket.io/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    
    # Важно для WebSocket
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    
    include /etc/nginx/conf.d/proxy-headers.conf;
    
    # Увеличенные таймауты для WebSocket
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# ═══════════════════════════════════════════
# Health Check для Backend
# ═══════════════════════════════════════════
location /api/health {
    access_log off;
    proxy_pass http://backend/health;
    proxy_http_version 1.1;
}

# ═══════════════════════════════════════════
# Frontend (React SPA) - всё остальное
# ═══════════════════════════════════════════
location / {
    # Rate limiting для статики
    limit_req zone=general burst=20 nodelay;
    
    proxy_pass http://frontend/;
    proxy_http_version 1.1;
    
    include /etc/nginx/conf.d/proxy-headers.conf;
}

# ═══════════════════════════════════════════
# Кеширование статических ресурсов Frontend
# ═══════════════════════════════════════════
# location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
#     proxy_pass http://frontend/;
#     proxy_http_version 1.1;
    
#     # Долгосрочное кеширование (Vite добавляет хеши к файлам)
#     expires 1y;
#     add_header Cache-Control "public, immutable";
#     access_log off;
# }
