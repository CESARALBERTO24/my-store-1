# 🛒 My Store - Dropshipping con Amazon PA-API

Backend en NestJS + TypeScript con Redis para caché y Amazon PA-API 5.0.

---

## 🚀 Inicio Rápido

### 1. Requisitos
- Node.js 18+
- Docker y Docker Compose
- Cuenta en Amazon Associates

### 2. Instalar dependencias
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Edita .env con tus credenciales de Amazon
```

### 4. Levantar base de datos y Redis
```bash
cd ..
docker-compose up -d
```

### 5. Iniciar el backend
```bash
cd backend
npm run start:dev
```

---

## 📡 Endpoints disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/products/search?q=iphone` | Buscar productos en Amazon |
| GET | `/products/amazon/:asin` | Detalle de producto por ASIN |

### Ejemplo de uso
```
GET http://localhost:3000/products/search?q=iphone+15
GET http://localhost:3000/products/amazon/B0CHX2DSTG
```

---

## 🗂 Estructura del proyecto

```
backend/src/
├── cache/
│   ├── cache.module.ts       # Configuración Redis
│   └── cache.service.ts      # Servicio de caché
├── integrations/
│   └── amazon/
│       ├── amazon.module.ts  # Módulo Amazon
│       └── amazon.service.ts # Integración PA-API 5.0
├── modules/
│   └── products/
│       ├── products.controller.ts
│       ├── products.module.ts
│       └── products.service.ts
├── app.module.ts
└── main.ts
```

---

## ⏱ TTL de Caché Redis

| Tipo | Tiempo |
|------|--------|
| Búsqueda de productos | 15 minutos |
| Detalle de producto | 30 minutos |

---

## 🔑 Cómo obtener credenciales de Amazon

1. Regístrate en https://affiliate-program.amazon.com
2. Una vez aprobado, ve a **Tools → Product Advertising API**
3. Genera tu **Access Key** y **Secret Key**
4. Tu **Partner Tag** es tu ID de afiliado (ej: `mitienda-20`)

---

## 📦 Próximos pasos
- [ ] Integración Walmart Open API
- [ ] Integración eBay Browse API
- [ ] Módulo de autenticación JWT
- [ ] Módulo de pagos con Stripe
- [ ] Frontend con Next.js
- [ ] Despliegue en AWS
