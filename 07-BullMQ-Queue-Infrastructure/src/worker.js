import { Worker } from 'bullmq'
import { connection } from './queue'

const worker = new Worker(
  'emails', //Queue name from which you want to take the worker
  async job => {
    console.log('Processing email Job...', job.id, job.name, job.data)
    await new Promise(resolve => setTimeout(resolve, 1500)),
      console.log('Email Job Completed!!', job.id, job.name, job.data)
  }, //Business logic here,
  { connection } //Connection
)

//Listener for worker to do which triggers when completed
worker.on('completed', job => {
  console.log('Job Completed!!', job.id, job.name, job.data)
})

//Listener for worker to do which triggers when failed
worker.on('failed', job => {
  console.log('Job Failed!!', job.id, job.name, job.data)
})
