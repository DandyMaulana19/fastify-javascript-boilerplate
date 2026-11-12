# Fastify Boilerplate

A ready-to-use Fastify starter template with JWT authentication, Redis caching, MinIO object storage, and Nodemon for development.

## Features

- Fastify server setup
- JWT-based authentication
- Redis integration
- MinIO support for file/object storage
- Environment variable configuration
- Hot reload with Nodemon

## Installation

1. Clone the project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create and configure your `.env` file
4. Start Redis and MinIO services
5. Run the application:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your_jwt_secret
REDIS_HOST=localhost
REDIS_PORT=6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=your_bucket_name
```

## Project Scripts

```bash
npm run dev
npm run start
```

## Tech Stack

- Node.js
- Fastify
- JWT
- Redis
- MinIO
- Nodemon
- dotenv

## Author

- [@DandyMaulana19](https://www.github.com/DandyMaulana19)
