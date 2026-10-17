# COMP3123 Assignment 1 - Employee API

A REST API where users sign up, log in, and manage their own employees.
Built with Node.js, Express, TypeScript and MongoDB.

## Technologies
Node.js, Express, TypeScript, MongoDB, Mongoose, bcrypt, jsonwebtoken (JWT), zod, helmet,
express-rate-limit, winston, morgan, dotenv, Docker, Postman.

## Project structure
```
src/
  index.ts        starts the server
  app.ts          express app setup
  config/         database connection
  models/         User and Employee schemas
  routes/         API routes
  controllers/    route logic
  middleware/     auth, validation, rate limiting, logging, errors
  validators/     zod validation rules
  utils/          logger
postman/          Postman collection
ScreenShots/      screenshots
```

## How to run
1. Clone the repo: `git clone <repo-url>`
2. Install packages: `npm install`
3. Copy `.env.example` to `.env` and fill in the values
4. Start MongoDB: `docker compose up -d`
5. Start the app: `npm run dev`
6. Test: open `http://localhost:3000/health` or use the Postman collection

## Environment variables
| Name | Description |
|---|---|
| PORT | Server port (default 3000) |
| MONGODB_URI | MongoDB connection string (database `comp3123_assignment1`) |
| JWT_SECRET | Secret used to sign JWTs |
| MONGO_USER / MONGO_PASSWORD | MongoDB user for docker compose |

## Endpoints
| Method | URL | Status |
|---|---|---|
| POST | /api/v1/user/signup | 201 |
| POST | /api/v1/user/login | 200 |
| GET | /api/v1/emp/employees | 200 |
| POST | /api/v1/emp/employees | 201 |
| GET | /api/v1/emp/employees/{eid} | 200 |
| PUT | /api/v1/emp/employees/{eid} | 200 |
| DELETE | /api/v1/emp/employees?eid=xxx | 204 |
| GET | /health | 200 |

## Authentication
- Signup saves the password as a bcrypt hash.
- Login (username or email + password) returns a JWT that expires in 1 hour.
- Employee routes need the header `Authorization: Bearer <token>`. Missing, invalid or expired tokens get 401.

## Authorization
Each employee has a `user` field with the id of the user who created it (taken from the token).
Users can only list, view, update and delete their own employees. Accessing another user's
employee returns 403. An employee that doesn't exist returns 404.

## Security
- Passwords hashed with bcrypt and never returned
- JWT authentication
- Helmet adds security headers
- Input validated with zod
- Secrets stored in `.env` (not committed)

## Rate limiting
Rate limiting limits how many requests one IP can send in a time window, to stop brute-force
login attempts and spam.
- Signup and login: 10 requests per 15 minutes
- Other `/api` routes: 100 requests per 15 minutes

When the limit is exceeded the API returns `429 Too Many Requests` with
`{"message":"Too many attempts, please try again later"}`.

## Logging
Logs are saved in `logs/app.log` and `logs/error.log`. They include requests (method, path,
status), signup/login attempts, rejected tokens, validation errors, 403s, employee changes,
rate-limit hits and errors. Passwords, tokens and secrets are never logged.

## Health check
`GET http://localhost:3000/health` returns:
```json
{ "status": "UP", "uptime": 12.3, "timestamp": "2026-10-17T15:34:56.184Z" }
```

## Postman
Import `postman/COMP3123 Assignment 1.postman_collection.json`. Log in first, then paste the
token and employee ids where the requests say `PASTE_...`.

## Sample credentials
| Username | Email | Password |
|---|---|---|
| arman | arman@example.com | Password123! |
| bob | bob@example.com | Password123! |
