import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { errorHandler } from './middlewares/errorHandler.js'
import { rateLimiter } from './middlewares/rateLimiter.js'
import apiRouter from './routes.js'
import swaggerDocument from './config/swagger.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }))

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'UP', timestamp: new Date() })
})

app.use('/api', apiRouter)
app.use(errorHandler)

export default app