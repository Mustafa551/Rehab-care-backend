# Action Backend SQL

A local backend server using MySQL database with pure SQL queries (no ORM).

## Features

- Express.js server
- MySQL database with pure SQL queries
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
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=action_backend
DB_PORT=3306
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

The application uses MySQL database. Configure your MySQL connection using the environment variables:
- `DB_HOST`: MySQL server host (default: localhost)
- `DB_USER`: MySQL username (default: root)
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (default: action_backend)
- `DB_PORT`: MySQL port (default: 3306)

### Database Setup

1. Make sure MySQL is installed and running on your system
2. Create a database for the application:
   ```sql
   CREATE DATABASE action_backend;
   ```
3. Update your `.env` file with your MySQL credentials
4. The application will automatically create the required tables on first run
5. Alternatively, you can run the setup script: `mysql -u root -p < scripts/setup-database.sql`

Tables:
- `users` - User information
- `fcm_tokens` - FCM tokens for push notifications

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

You can also use the `API_BYPASS_KEY` for development/testing by setting it in the Authorization header.

