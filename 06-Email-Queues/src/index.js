import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const redisClient = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379/'
)

const QUEUE_KEY = 'queue:emails' //standard Convention

app.post('/emails', async (req, res) => {
  const job = {
    to: req.body.to,
    subject: req.body.subject || 'No subject',
    body: req.body.body || 'No content',
    createdAt: new Date().toISOString()
  }

  // We are pushing jobs into queue from left and popping from right. lpush is for pushing from left, rpush to push from right
  await redisClient.lpush(QUEUE_KEY, JSON.stringify(job))
  res.json({
    queued: true,
    job
  })
})

app.get('/emails/process-one', async (req, res) => {
  const rawJob = await redisClient.rpop(QUEUE_KEY)
  if (!rawJob) {
    return res.json({
      message: 'No jobs in queue'
    })
  }

  const job = JSON.parse(rawJob)
  // Simulate email sending
  res.json({
    message: 'Email Sent',
    job
  })
})

app.listen(3000, () => {
  console.log('Server Running on 3000')
})
