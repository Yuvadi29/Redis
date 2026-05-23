import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const redisClient = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379/'
)

// User gives phone number and we return the otp here
// This is the OTP key linked to phone number
function generateOTPKey (phone) {
  return `otp:${phone}`
}

app.post('/otp', async (req, res) => {
  const { phone } = req.body

  if (!phone) {
    return res.status(400).json({ message: 'Phone is required' })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // Setting the otp on redis
  await redisClient.set(generateOTPKey(phone), otp, 'EX', 30) // OTP valid for 30 seconds
  res.json({
    message: 'OTP sent',
    otp
  })
})

app.post('/otp/verify', async (req, res) => {
  const { phone, otp } = req.body

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' })
  }

  const savedOTP = await redisClient.get(generateOTPKey(phone))

  if (!savedOTP) {
    return res.status(400).json({
      message: 'OTP expired or not found'
    })
  }

  if (savedOTP !== otp) {
    return res.status(400).json({
      message: 'Invalid OTP'
    })
  }

  // if otp matches, delete the otp
  await redisClient.del(generateOTPKey(phone))
  res.json({ message: 'OTP Verified Successfully' })
})

app.get('/otp/:phone/ttl', async (req, res) => {
  const ttl = await redisClient.ttl(generateOTPKey(req.params.phone))
  res.json({ ttl })
})

app.listen(3000, () => {
  console.log('Server Running on 3000')
})
