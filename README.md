# Crypbuy Auth API

API de autenticacao em Node.js com Express, JWT e bcrypt.

## Stack

- Express
- jsonwebtoken
- bcryptjs
- CORS + Helmet + Morgan
- Persistencia local em `data/users.json`

## Setup

1. Copie `.env.example` para `.env`
2. Instale dependencias
3. Rode em desenvolvimento

```bash
npm install
npm run dev
```

Servidor padrao: `http://localhost:4000`

## Endpoints

- `GET /health`
- `POST /api/v1/auth/register/`
- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/password/reset/`
- `POST /api/v1/auth/token/refresh/`
- `POST /api/v1/auth/logout/`
- `GET /api/v1/auth/me/` (Bearer token)

## Exemplo de payload

### Register/Login

```json
{
  "email": "user@email.com",
  "password": "12345678",
  "name": "User"
}
```

### Refresh/Logout

```json
{
  "refresh": "refresh_token_aqui"
}
```
