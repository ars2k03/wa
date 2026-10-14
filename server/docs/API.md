# WhatsApp OTP Gateway — API Documentation

Comprehensive REST API documentation for the **WhatsApp OTP Gateway** backend service.

> 🚀 **Postman Collection**: A ready-to-use Postman collection is available at [`postman_collection.json`](./postman_collection.json). Simply import this file into Postman to instantly test all 14 endpoints with automatic JWT token and API key handling.

---

## 📌 Table of Contents
- [Overview & Base URL](#overview--base-url)
- [Authentication Mechanisms](#authentication-mechanisms)
- [Rate Limiting & Security](#rate-limiting--security)
- [Standard Response Formats](#standard-response-formats)
- [API Quick Reference Table](#api-quick-reference-table)
- [Endpoints](#endpoints)
  - [1. System & Health](#1-system--health)
  - [2. User Authentication](#2-user-authentication)
  - [3. Email OTP Verification](#3-email-otp-verification)
  - [4. API Key Management](#4-api-key-management)
  - [5. WhatsApp Device Sessions](#5-whatsapp-device-sessions)
  - [6. WhatsApp Dispatch & Logs](#6-whatsapp-dispatch--logs)
- [End-to-End Workflow Example](#end-to-end-workflow-example)

---

## Overview & Base URL

* **Default Local Base URL:** `http://localhost:3002`
* **Default Port:** `3002` (configurable via `PORT` in `.env`)
* **Data Format:** `application/json`

---

## Authentication Mechanisms

The API utilizes two distinct authentication strategies depending on the resource:

### 1. User JWT Authentication (`AuthGuard`)
Used for user account operations, session lifecycle, and dashboard management.
* **Header format:**
  ```http
  Authorization: Bearer <your_jwt_access_token>
  ```

### 2. API Key Authentication (`ApiKeyGuard`)
Used for dispatching WhatsApp messages from third-party applications, microservices, or backend workers.
* **Supported Header formats (either one):**
  ```http
  x-api-key: _ars_2k03_xxxxxxxxxxxxxxxxxxxxxxxx
  ```
  *or*
  ```http
  Authorization: Bearer _ars_2k03_xxxxxxxxxxxxxxxxxxxxxxxx
  ```

---

## Rate Limiting & Security

* **Global Rate Limit:** 30 requests per minute (`ttl: 60s`, `limit: 30`) enforced by NestJS Throttler.
* **Security Headers:** Powered by Helmet.
* **CORS:** Configurable via `ALLOWED_ORIGINS` (defaults to local origins and server-to-server calls).

---

## Standard Response Formats

### Successful Response (HTTP 200 / 201)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response (HTTP 400 / 401 / 403 / 404 / 429 / 500)
```json
{
  "statusCode": 400,
  "message": "Detailed error message or validation failures",
  "error": "Bad Request"
}
```

---

## API Quick Reference Table

| # | Method | Endpoint | Auth | Purpose |
| :- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | Public | Server health & default session status |
| 2 | `POST` | `/auth/register` | Public | Register new user & send email OTP |
| 3 | `POST` | `/auth/login` | Public | Login with credentials and receive JWT |
| 4 | `GET` | `/auth/me` | JWT | Get current authenticated user profile |
| 5 | `POST` | `/otp/send` | Public | Request a 6-digit email verification OTP |
| 6 | `POST` | `/otp/verify` | Public | Verify email OTP & activate user account |
| 7 | `POST` | `/api-keys` | JWT | Generate a new API Key |
| 8 | `GET` | `/api-keys/:userId` | JWT | List all API Keys for the user |
| 9 | `DELETE`| `/api-keys/:keyId` | JWT | Revoke / delete an API Key |
| 10 | `POST` | `/sessions/:sessionId/init` | JWT | Initialize a WhatsApp session & get QR Code |
| 11 | `GET` | `/sessions/:sessionId/status` | JWT | Check device pairing / connection status |
| 12 | `DELETE`| `/sessions/:sessionId` | JWT | Disconnect & remove WhatsApp session |
| 13 | `POST` | `/send-otp` | API Key | Send WhatsApp OTP / text to phone number |
| 14 | `GET` | `/message-logs` | JWT | Retrieve dispatched message history & logs |

---

## Endpoints

---

### 1. System & Health

#### `GET /`
Returns gateway health and WhatsApp connection status.

* **Auth:** Public
* **Headers:** None required

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "service": "WhatsApp OTP Gateway",
  "status": "connected",
  "timestamp": "10/14/2026, 11:35:00 AM"
}
```

---

### 2. User Authentication

#### `POST /auth/register`
Creates an unverified user account and automatically triggers a 6-digit verification code to the provided email address.

* **Auth:** Public
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securePassword123"
  }
  ```
  * `email` (string, required): Valid email address.
  * `name` (string, optional): Full name of the user (defaults to email username).
  * `password` (string, optional): Minimum 6 characters.

**Example Response (201 Created):**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Account created. Please check your email for the 6-digit verification code.",
  "data": {
    "email": "user@example.com",
    "isVerified": false
  }
}
```

---

#### `POST /auth/login`
Authenticates user credentials and returns a JWT token. If the account is not verified, it dispatches a fresh OTP and returns a 403 Forbidden status.

* **Auth:** Public
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```

**Example Response (200 OK — Verified User):**
```json
{
  "statusCode": 200,
  "success": true,
  "isVerified": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cm2xxxxxxxxx",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Example Response (403 Forbidden — Unverified User):**
```json
{
  "statusCode": 403,
  "success": false,
  "isVerified": false,
  "message": "Account not verified. A new 6-digit verification code has been sent to your email.",
  "data": {
    "email": "user@example.com"
  }
}
```

---

#### `GET /auth/me`
Retrieves the logged-in user profile from the JWT payload.

* **Auth:** `Bearer <token>`
* **Headers:**
  ```http
  Authorization: Bearer <token>
  ```

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "id": "cm2xxxxxxxxx",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

---

### 3. Email OTP Verification

#### `POST /otp/send`
Dispatches a 6-digit verification code to the registered email address via Gmail API.

* **Auth:** Public
* **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Verification code sent successfully to your email"
}
```

---

#### `POST /otp/verify`
Validates the 6-digit OTP code received by email. Once verified, marks the user account as active (`isVerified: true`).

* **Auth:** Public
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "489201"
  }
  ```
  * `otp` (string, required): Exactly 6 numeric digits.

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

---

### 4. API Key Management

#### `POST /api-keys`
Generates a new secure API Key with prefix `_ars_2k03_`. The key can optionally be linked to a specific WhatsApp session.

* **Auth:** `Bearer <token>`
* **Request Body:**
  ```json
  {
    "name": "E-Commerce Production Key",
    "sessionId": "session_user_01"
  }
  ```
  * `name` (string, optional): Key identifier/label.
  * `sessionId` (string, optional): Specific WhatsApp session ID to route messages through.

**Example Response (201 Created):**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "API Key generated successfully",
  "data": {
    "id": "clxxxxxxxxxxx",
    "key": "_ars_2k03_a9f1b8c2d3e4f5061728394a5b6c7d8e9f0123456789abcd",
    "name": "E-Commerce Production Key",
    "userId": "cm2xxxxxxxxx",
    "sessionId": "session_user_01",
    "isActive": true,
    "createdAt": "2026-10-14T05:30:00.000Z",
    "lastUsedAt": null
  }
}
```

---

#### `GET /api-keys/:userId`
Lists all API keys created by the user.

* **Auth:** `Bearer <token>`
* **Path Parameter:**
  * `userId` (string): The user ID or literal string `"me"` to fetch the logged-in user's keys.

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxxx",
      "key": "_ars_2k03_a9f1b8c2d3e4f5061728394a5b6c7d8e9f0123456789abcd",
      "name": "E-Commerce Production Key",
      "userId": "cm2xxxxxxxxx",
      "sessionId": "session_user_01",
      "isActive": true,
      "createdAt": "2026-10-14T05:30:00.000Z",
      "lastUsedAt": "2026-10-14T06:12:45.000Z"
    }
  ]
}
```

---

#### `DELETE /api-keys/:keyId`
Revokes and permanently removes an API Key.

* **Auth:** `Bearer <token>`
* **Path Parameter:**
  * `keyId` (string): The unique ID of the API key to delete.

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API Key deleted successfully",
  "data": {
    "id": "clxxxxxxxxxxx",
    "deleted": true
  }
}
```

---

### 5. WhatsApp Device Sessions

#### `POST /sessions/:sessionId/init`
Initializes a Baileys WhatsApp multi-device connection for the given session ID and returns a QR Code string and Base64 Data URL for pairing.

* **Auth:** `Bearer <token>`
* **Path Parameter:**
  * `sessionId` (string): Unique identifier for this WhatsApp device session (e.g. `session_01`).
* **Request Body (optional):**
  ```json
  {}
  ```

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Session initialization triggered",
  "data": {
    "sessionId": "session_01",
    "status": "qr_ready",
    "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "qrRaw": "2@b9c1d2e3f4g5...",
    "phoneNumber": null,
    "linking": false,
    "qrRefreshing": false,
    "qrExpired": false,
    "lastError": null
  }
}
```

---

#### `GET /sessions/:sessionId/status`
Polls the real-time status of the WhatsApp session (e.g., whether the QR code was scanned and the device is connected).

* **Auth:** `Bearer <token>`
* **Path Parameter:**
  * `sessionId` (string): The session ID to check.

**Connection Statuses:**
* `connecting`: Initial socket negotiation in progress.
* `qr_ready`: Waiting for the user to scan the QR code from the WhatsApp mobile app.
* `connected`: Device successfully paired and ready to transmit messages.
* `disconnected`: Session closed or logged out.

**Example Response (200 OK — Connected):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "sessionId": "session_01",
    "status": "connected",
    "qr": null,
    "qrRaw": null,
    "phoneNumber": "8801700000000",
    "linking": false,
    "qrRefreshing": false,
    "qrExpired": false,
    "lastError": null
  }
}
```

---

#### `DELETE /sessions/:sessionId`
Disconnects the WhatsApp socket, removes authentication credentials from Redis/storage, and deletes the session record.

* **Auth:** `Bearer <token>`
* **Path Parameter:**
  * `sessionId` (string): The session ID to terminate.

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Session \"session_01\" deleted successfully"
}
```

---

### 6. WhatsApp Dispatch & Logs

#### `POST /send-otp`
Dispatches an interactive OTP verification message containing a one-tap copy button to the target WhatsApp number.

* **Auth:** `ApiKeyGuard` (via `x-api-key` header or `Authorization: Bearer <api_key>`)
* **Headers:**
  ```http
  x-api-key: _ars_2k03_xxxxxxxxxxxxxxxxxxxxxxxx
  Content-Type: application/json
  ```
* **Request Body:**
  ```json
  {
    "phoneNumber": "01712345678",
    "otp": "592104",
    "sessionId": "session_01"
  }
  ```
  * `phoneNumber` (string, required): Recipient WhatsApp number (supports local format `01XXXXXXXXX` or international format `8801XXXXXXXXX`).
  * `otp` (string, required): The OTP code to display and embed in the copy button.
  * `sessionId` (string, optional): Specific session to send through (optional if key is tied to a session or only one connected session exists).

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "messageId": "3EB0XXXXXXXXXXXX",
    "recipientJid": "8801712345678@s.whatsapp.net",
    "senderSession": "session_01"
  }
}
```

---

#### `GET /message-logs`
Fetches the last 100 message audit logs associated with the authenticated user's API keys and WhatsApp sessions.

* **Auth:** `Bearer <token>`
* **Headers:**
  ```http
  Authorization: Bearer <token>
  ```

**Example Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "id": "clyxxxxxxxxxxx",
      "sessionId": "session_01",
      "apiKey": "_ars_2k03_a9f1b8c2...",
      "recipient": "01712345678",
      "messageType": "otp",
      "messageId": "3EB0XXXXXXXXXXXX",
      "status": "sent",
      "createdAt": "2026-10-14T06:15:20.000Z"
    }
  ]
}
```

---

## End-to-End Workflow Example

Follow this step-by-step sequence to get started:

### Step 1: Register an Account
```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "name": "Jane Developer",
    "password": "MyStrongPassword!23"
  }'
```

### Step 2: Verify Your Email
Check your email inbox for the 6-digit code:
```bash
curl -X POST http://localhost:3002/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "otp": "123456"
  }'
```

### Step 3: Login to Obtain JWT Token
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "MyStrongPassword!23"
  }'
```
*Save the returned `token` from the response.*

### Step 4: Initialize WhatsApp Device Session
```bash
curl -X POST http://localhost:3002/sessions/my_session/init \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```
*Open WhatsApp on your phone > Linked Devices > Link a Device > Scan the `qr` (or terminal QR).*

### Step 5: Check Pairing Status
```bash
curl -X GET http://localhost:3002/sessions/my_session/status \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```
*Wait until `"status": "connected"`.*

### Step 6: Generate an API Key
```bash
curl -X POST http://localhost:3002/api-keys \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "App Backend Key",
    "sessionId": "my_session"
  }'
```
*Save the generated `key` (`_ars_2k03_...`).*

### Step 7: Send a WhatsApp OTP
```bash
curl -X POST http://localhost:3002/send-otp \
  -H "x-api-key: <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "01700000000",
    "otp": "942013"
  }'
```
