# RehabCare Backend SQL

A local backend server using MSSQL database with pure SQL queries (no ORM).

## Features

- Express.js server
- MSSQL database with pure SQL queries
- User management (CRUD operations)
- FCM token management
- JWT authentication
- Request validation using express-validator
- TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=8000
JWT_SECRET=your-secret-key-here
DB_HOST=localhost
DB_NAME=rehabCare_backend
DB_PORT=1433
API_BYPASS_KEY=your-api-bypass-key-here
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### User Endpoints

- `POST /api/v1/user` - Create a new user
- `GET /api/v1/user?userId=<id>` - Get user by ID
- `PATCH /api/v1/user/:userId` - Update user
- `DELETE /api/v1/user/:userId` - Delete user
- `PATCH /api/v1/user/:userId/update-fcm` - Update FCM token
- `PATCH /api/v1/user/:userId/reminder` - Update streak reminder settings

## Database

The application uses MSSQL database with Windows Authentication. Configure your MSSQL connection using the environment variables:
- `DB_HOST`: MSSQL server host (default: localhost)
- `DB_NAME`: Database name (default: rehabCare_backend)
- `DB_PORT`: MSSQL port (default: 1433)

### Database Setup

1. Make sure SQL Server is installed and running on your system
2. Create a database for the application:
   ```sql
   CREATE DATABASE rehabCare_backend;
   ```
3. Update your `.env` file with your MSSQL server details
4. The application will automatically create the required tables on first run using Windows Authentication
5. Alternatively, you can run the setup script: `sqlcmd -S localhost -E -i scripts/setup-database.sql`

Tables:
- `users` - User information
- `fcm_tokens` - FCM tokens for push notifications

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

You can also use the `API_BYPASS_KEY` for development/testing by setting it in the Authorization header.

