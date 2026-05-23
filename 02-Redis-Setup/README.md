# Just remember, Redis does not depend on what is the kind of Database you are using.

### We are going to use Docker here. So the first task is to create a docker-compose.yml file.

## Understanding `docker-compose.yml`

This `docker-compose.yml` file is like a blueprint that tells Docker how to set up and run multiple related services (like our Redis and MongoDB databases) together. It makes it super easy to get our development environment running with a single command.

Let's break down each part:

1.  **`services`**:
    *   This is the main section where we define all the different applications or "services" that our project needs. Each service will run in its own isolated container.

2.  **`redis` Service**:
    *   This defines our Redis database service.
    *   `image: redis:latest`: This tells Docker to download and use the latest official Redis image from Docker Hub. An "image" is a lightweight, standalone, executable package that includes everything needed to run a piece of software.
    *   `container_name: redis-tutorial`: We're giving our Redis container a friendly, easy-to-remember name. This makes it easier to refer to it later (e.g., in Docker commands).
    *   `ports: - "6379:6379"`: This is crucial for accessing Redis from our Node.js application (or from our host machine). It maps port `6379` on our computer (the "host") to port `6379` inside the Redis container. So, when our Node.js app tries to connect to `localhost:6379`, it's actually connecting to the Redis container.
    *   `command: ["redis-server", "--appendonly", "yes"]`: This specifies the command that Docker should run when the Redis container starts. Here, we're starting the `redis-server` and enabling `appendonly yes`, which is a persistence option for Redis to make sure our data isn't lost if the container restarts.
    *   `volumes: - redis-data:/data`: This sets up a "volume" for Redis. Volumes are how Docker stores data persistently. This line tells Docker to take the `/data` directory *inside* the Redis container (where Redis stores its data) and link it to a named Docker volume called `redis-data`. This means even if you stop, remove, or recreate the Redis container, your Redis data will still be safe in the `redis-data` volume.

3.  **`mongo` Service**:
    *   This defines our MongoDB database service.
    *   `image: mongo:7`: This tells Docker to use the official MongoDB image, specifically version 7.
    *   `container_name: mongo`: We're naming our MongoDB container "mongo" for easy identification.
    *   `ports: - "27017:27017"`: Similar to Redis, this maps port `27017` on our host machine to port `27017` inside the MongoDB container. This is the default port for MongoDB.
    *   `environment: MONGO_INITDB_DATABASE: redis`: This sets an environment variable *inside* the MongoDB container. When MongoDB starts, it will automatically create a database named `redis` for us, which is handy for our `index.js` file that expects to connect to a database called `redis`.
    *   `volumes: - mongo-data:/data/db`: This sets up a persistent volume for MongoDB. The `/data/db` directory *inside* the MongoDB container (where MongoDB stores its database files) is linked to a named Docker volume called `mongo-data`. This ensures our MongoDB data remains intact across container restarts.

4.  **`volumes` (bottom section)**:
    *   This section at the bottom is where we formally declare the named volumes that we used in our services.
    *   `redis-data:` and `mongo-data:`: By simply listing them here, Docker knows to create and manage these volumes for us, ensuring data persistence for our Redis and MongoDB services.

In essence, `docker-compose.yml` allows us to define our entire multi-container application stack in a single file, making it incredibly easy to start, stop, and manage our development environment consistently. It ensures that both Redis and MongoDB are running and correctly configured when we need them.

Start the service by using `docker compose up`. Initially it will take time to start for the first time. During this time it will fetch the images and install it on your machine. Once completed, you will be able to see the services running on your Docker Desktop like this.

![Docker Desktop Applications](<docker-desktop-service.png>)

Next is to setup a `package.json` with the following packages: 
- express
- mongoose
- ioredis

Once you are done with installing the packages, go ahead with creating `index.js` under `src` folder and copy the code into the `index.js`

## Understanding `src/index.js`

This `index.js` file sets up a simple web server using Node.js and the Express framework. It demonstrates how to connect to both a Redis server and a MongoDB database.

Here's a breakdown of what each part does:

1.  **Setting up the Web Server with Express:**
    *   `import express from "express";`: This line brings in the Express library, which helps us create a web application easily.
    *   `const app = express();`: This creates an instance of our Express application.

2.  **Connecting to Redis with `ioredis`:**
    *   `import Redis from "ioredis";`: This imports the `ioredis` library, a powerful client for interacting with Redis.
    *   `const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');`: This line establishes a connection to your Redis server. It first checks for an environment variable named `REDIS_URL`. If that's not set (which is common in development), it defaults to connecting to Redis on your local machine at `localhost:6379`, which is the standard port for Redis. This is especially useful when running Redis in a Docker container.
    *   **`/ping` Endpoint:**
        *   `app.get('/ping', async (req,res) => { ... });`: This sets up a special address on our web server: `/ping`. When you visit `http://localhost:3000/ping` in your browser or with a tool, this code runs.
        *   `const reply = await redis.ping();`: Inside this endpoint, we tell Redis to send back a "PONG" response. This is a simple way to check if our Redis connection is active and working.
        *   `res.json({ redis: reply });`: The server then sends back a JSON response showing the reply from Redis (which should be "PONG").

3.  **Connecting to MongoDB with `mongoose`:**
    *   `import mongoose from "mongoose";`: This imports the Mongoose library, which is a popular tool for interacting with MongoDB databases in Node.js. It helps manage data relationships, schema validation, and more.
    *   **`/mongo` Endpoint:**
        *   `app.get('/mongo', async (req,res) => { ... });`: This sets up another address on our web server: `/mongo`. Visiting `http://localhost:3000/mongo` will trigger this code.
        *   `const url = process.env.MONGO_URL || 'mongodb://localhost:27017/redis';`: Similar to Redis, this line tries to get the MongoDB connection string from an environment variable `MONGO_URL`. If it's not found, it defaults to connecting to a MongoDB instance on `localhost:27017` (the default MongoDB port) and connects to a database named `redis`.
        *   `if(mongoose.connection.readyState === 0){ await mongoose.connect(url); }`: This important check ensures that we only try to connect to MongoDB if we aren't already connected. `readyState === 0` means disconnected.
        *   `res.json({ mongo: 'Connected', database: mongoose.connection.name });`: If the connection is successful (or already established), the server sends back a JSON response confirming the connection and showing the name of the connected database.

4.  **Starting the Server:**
    *   `app.listen(3000, () => { console.log("Server Running on 3000"); });`: This line starts our Express web server. It tells the server to listen for incoming requests on port `3000`. Once the server is running, you'll see "Server Running on 3000" in your console.

In summary, this `index.js` file provides a basic setup for a Node.js application that can interact with both Redis (for fast caching or messaging) and MongoDB (for a more traditional database). It's a great starting point for building more complex applications that leverage these powerful tools.

