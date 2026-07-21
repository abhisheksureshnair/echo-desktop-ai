# Echo Backend Service

A robust Express & MongoDB API server powering Echo's desktop application and browser extensions. It provides secure user authentication, JWT sessions, encrypted AI model credential storage, and status syncing.

## Key Upgrades Completed Today (July 21, 2026)

* **Express & Database Transition**: Replaced the pure, built-in Node.js HTTP implementation with an Express-based MVC structure, introducing MongoDB connectivity via Mongoose.
* **JWT User Authentication**: Configured JWT generation, validation middleware, and secure password hashing using `bcrypt`.
* **Encrypted Credential Storage**: Added secure CryptoJS AES encryption to protect user API Keys and base URLs in the database.
* **AI Model Provisioning endpoints**: Created routers to configure and query active model settings per user.

---

## Technical Stack

* **Runtime & Framework**: Node.js, Express.js
* **Database**: MongoDB (via Mongoose)
* **Authentication**: JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcrypt`)
* **Security**: AES encryption (`crypto-js`) for API keys

---

## File Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js            # MongoDB Connection configuration
│   ├── middleware/
│   │   └── auth.middleware.js # JWT payload decryption & route guard
│   ├── models/
│   │   ├── Users.js         # User schema (hashed passwords)
│   │   └── AIModels.js      # Encrypted AI Provider config schema
│   ├── controllers/
│   │   ├── auth.controllers.js # Login, Registration, Profile fetch
│   │   └── ai.controllers.js   # Add model, Retrieve model settings
│   ├── routes/
│   │   ├── auth.routes.js   # Auth router mapping
│   │   └── ai.routes.js     # AI endpoints router mapping
│   ├── utils/
│   │   ├── jwt.js           # JWT token signers
│   │   └── encryption.js    # CryptoJS encrypt/decrypt wrappers
│   ├── app.js               # Express application initialization
│   └── server.js            # Node HTTP server startup
├── package.json
└── README.md
```

---

## Setup & Run

### 1. Installation
Install dependencies:
```bash
cd backend
npm install
```

### 2. Configuration
Copy `.env.example` to `.env` and set up the following environment variables:
```ini
PORT=8080
MONGO_URI=mongodb://localhost:27017/echo
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_aes_encryption_key
```

### 3. Start Development Server
```bash
npm run dev
```

---

## API Endpoints

### 🔐 Authentication (`/api/auth`)
* `POST /registration` - Register a new user (Fullname, Email, Password).
* `POST /login` - Login to account (returns token and user details).
* `GET /me` - Fetch authenticated user info (requires bearer token).

### 🤖 AI Assist Service (`/api/assistence`)
* `POST /add-model` - Configure/activate custom AI provider settings (requires bearer token; encrypts API keys before storing).
* `GET /fetch-model` - Retrieve the user's configured AI model details (requires bearer token; decrypts credentials).
