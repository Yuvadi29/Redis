import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const redisClient = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379/'
)

app.post('/user/:id/json', async (req, res) => {
  await redisClient.set(`user:${req.params.id}:json`, JSON.stringify(req.body))
  res.json({
    savedAs: 'json'
  })
})

app.get('/user/:id/json', async (req, res) => {
  const raw = await redisClient.get(`user:${req.params.id}:json`)
  res.json({
    user: raw ? JSON.parse(raw) : null
  })
})

app.post('/user/:id/hash', async (req, res) => {
  await redisClient.hset(`user:${req.params.id}:hash`, req.body)
  res.json({
    savedAs: 'hash'
  })
})

app.get('/user/:id/hash', async (req, res) => {
  const user = await redisClient.hgetall(`user:${req.params.id}:hash`)
  res.json({
    user
  })
})

app.listen(3000, () => {
  console.log('Server Running on 3000')
})
