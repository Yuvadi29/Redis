import { Queue } from 'bullmq'

const connection = {
  host: 'localhost',
  port: 6379
}

//We can create as many queues as we want here
const emailQueue = new Queue('emails', { connection })

module.exports = {
  emailQueue,
  connection
}
