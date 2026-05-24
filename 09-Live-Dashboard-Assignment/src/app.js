import express from 'express'
import leaderBoardRoutes from './routes/leaderboard.routes.js'
import viewsRoutes from './routes/views.routes.js'

const app = express()

app.use(express.json())

app.use('/leaderboard', leaderBoardRoutes)
app.use('/post', viewsRoutes)

export default app;
