# User Profile Storage with Redis

This project demonstrates two different ways to store user profiles in Redis using Node.js with Express and `ioredis`.

## Implementation Details

The application provides API endpoints to store and retrieve user profiles. It uses `express` for handling HTTP requests and `ioredis` for connecting to Redis.

**Redis Connection:**
The application connects to Redis using the `REDIS_URL` environment variable or defaults to `redis://localhost:6379/`.

### 1. Storing User Profiles as JSON Strings

This method stores the entire user profile object as a JSON string under a single Redis key.

*   **Redis Command Used:** `SET`
*   **Use Case:** Simple storage and retrieval where the entire object is usually accessed at once.

**Endpoints:**

*   **POST `/user/:id/json`**: Stores a user profile as a JSON string.
    *   **Request Body Example:**
        ```json
        {
            "name": "Alice",
            "email": "alice@example.com",
            "age": 30
        }
        ```
    *   **Example `curl` command to SET:**
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"name": "Alice", "email": "alice@example.com", "age": 30}' http://localhost:3000/user/1/json
        ```

*   **GET `/user/:id/json`**: Retrieves a user profile stored as a JSON string.
    *   **Example `curl` command to GET:**
        ```bash
        curl http://localhost:3000/user/1/json
        ```

### 2. Storing User Profiles as Redis Hashes

This method stores each field of the user profile object as a separate field within a Redis Hash data structure.

*   **Redis Command Used:** `HSET`, `HGETALL`
*   **Use Case:** Efficiently retrieving or updating individual fields of an object without fetching the entire object.

**Endpoints:**

*   **POST `/user/:id/hash`**: Stores a user profile as a Redis Hash. Each key-value pair in the request body becomes a field-value pair in the Redis Hash.
    *   **Request Body Example:**
        ```json
        {
            "name": "Bob",
            "email": "bob@example.com",
            "age": 25
        }
        ```
    *   **Example `curl` command to HSET:**
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"name": "Bob", "email": "bob@example.com", "age": 25}' http://localhost:3000/user/2/hash
        ```

*   **GET `/user/:id/hash`**: Retrieves all fields and values of a user profile stored as a Redis Hash.
    *   **Example `curl` command to HGETALL:**
        ```bash
        curl http://localhost:3000/user/2/hash
        ```

## Running the Application

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Start Redis Server:**
    Ensure a Redis server is running, e.g., via Docker Compose as defined in `../../docker-compose.yml`.
3.  **Start the Node.js Application:**
    ```bash
    npm start # Or node src/index.js
    ```
    The server will run on `http://localhost:3000`.
