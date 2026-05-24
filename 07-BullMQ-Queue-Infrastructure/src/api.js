import express from 'express'
import { emailQueue } from './queue.js'

const app = express()
app.use(express.json())

app.post('/welcome-email', async (req, res) => {
  const job = emailQueue.add(
    'send-welcome-email',
    {
      to: req.body.to,
      name: req.body.name || 'Learner'
    },
    //Configurations you can add
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    }
  )
  res.json({
    message: 'Welcome email job added to queue',
    jobId: job.id
  })
})

app.listen(3000, () => {
  console.log('Server Running on 3000')
})
