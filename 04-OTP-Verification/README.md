# OTP Verification Service with Redis

This project implements a simple One-Time Password (OTP) verification service using Express.js as the API framework and Redis as the highly performant, in-memory data store for managing OTPs.

## What is OTP Verification?

OTP (One-Time Password) verification is a security mechanism where a unique, temporary numeric or alphanumeric string is sent to a user's registered contact method (e.g., phone number, email) to authenticate their identity for a single transaction or login session. It enhances security by adding a second factor of authentication.

## How Redis is Used for OTPs

Redis is an ideal choice for storing OTPs due to its speed, simplicity, and built-in support for time-to-live (TTL) for keys.
*   **Fast Storage and Retrieval:** OTPs need to be generated and verified quickly. Redis's in-memory nature ensures low-latency operations.
*   **Automatic Expiration (TTL):** Each OTP stored in Redis is given a short expiration time (e.g., 30 seconds). This ensures that OTPs are temporary and cannot be reused after a certain period, which is crucial for security.
*   **Key-Value Store:** OTPs are stored with a key derived from the user's phone number (`otp:<phone_number>`), making them easy to retrieve and manage.

## API Endpoints

The application exposes the following RESTful API endpoints for OTP management:

### 1. `POST /otp` (Generate OTP)

*   **Description:** Generates a new 6-digit OTP for a given phone number and stores it in Redis with a 30-second expiry.
*   **Method:** `POST`
*   **Request Body:** `application/json`
    ```json
    {
      "phone": "1234567890"
    }
    ```
*   **Validation:** Returns `400 Bad Request` if `phone` is missing.
*   **Redis Operation:** `SET otp:<phone> <otp_code> EX 30`
*   **Success Response:** `200 OK`
    ```json
    {
      "message": "OTP sent",
      "otp": "123456" // In a real application, this OTP would be sent via SMS/email.
    }
    ```
*   **Flow Diagram (OTP Generation):**
    ```mermaid
    sequenceDiagram
        participant C as Client
        participant A as Express.js API
        participant R as Redis Server

        C->>A: POST /otp { "phone": "1234567890" }
        A->>A: Generate 6-digit OTP
        A->>R: SET otp:1234567890 "123456" EX 30
        R-->>A: OK
        A-->>C: { "message": "OTP sent", "otp": "123456" }
    ```

### 2. `POST /otp/verify` (Verify OTP)

*   **Description:** Verifies if the provided OTP matches the one stored for the given phone number. If successful, the OTP is deleted from Redis.
*   **Method:** `POST`
*   **Request Body:** `application/json`
    ```json
    {
      "phone": "1234567890",
      "otp": "123456"
    }
    ```
*   **Validation:** Returns `400 Bad Request` if `phone` or `otp` is missing.
*   **Redis Operations:**
    *   `GET otp:<phone>`
    *   `DEL otp:<phone>` (on successful verification)
*   **Success Response:** `200 OK`
    ```json
    {
      "message": "OTP Verified Successfully"
    }
    ```
*   **Error Responses:** `400 Bad Request`
    ```json
    {
      "message": "OTP expired or not found"
    }
    ```
    or
    ```json
    {
      "message": "Invalid OTP"
    }
    ```
*   **Flow Diagram (OTP Verification):**
    ```mermaid
    sequenceDiagram
        participant C as Client
        participant A as Express.js API
        participant R as Redis Server

        C->>A: POST /otp/verify { "phone": "1234567890", "otp": "123456" }
        A->>R: GET otp:1234567890
        R-->>A: "123456" (or nil if expired/not found)
        alt OTP Found and Matches
            A->>R: DEL otp:1234567890
            R-->>A: OK
            A-->>C: { "message": "OTP Verified Successfully" }
        else OTP Expired/Not Found
            A-->>C: { "message": "OTP expired or not found" }
        else OTP Mismatch
            A-->>C: { "message": "Invalid OTP" }
        end
    ```

### 3. `GET /otp/:phone/ttl` (Get OTP Time-To-Live)

*   **Description:** Retrieves the remaining time-to-live (in seconds) for the OTP associated with a specific phone number.
*   **Method:** `GET`
*   **URL Parameter:** `:phone` (e.g., `/otp/1234567890/ttl`)
*   **Redis Operation:** `TTL otp:<phone>`
*   **Success Response:** `200 OK`
    ```json
    {
      "ttl": 25 // Remaining seconds until OTP expires
    }
    ```
    *   `ttl: -2`: Indicates the key (OTP) does not exist.
    *   `ttl: -1`: Indicates the key exists but has no associated expire.

## Getting Started

To run this OTP verification service:

1.  **Ensure Redis is running:** You can use Docker or install it directly.
    *   If using Docker, ensure your `docker-compose.yml` includes a Redis service.
2.  **Navigate to the project directory:**
    ```bash
    cd 04-OTP-Verification
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Set Redis URL (if not default):**
    Set the `REDIS_URL` environment variable if your Redis instance is not at `redis://localhost:6379/`.
5.  **Start the application:**
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:3000`.

Now you can use tools like `curl` or Postman to interact with the API endpoints.
