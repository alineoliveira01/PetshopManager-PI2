import 'dotenv/config'
import app from './app.js'
import prisma from './config/database.js'

const PORT = process.env.PORT || 3000

async function bootstrap() {
  try {
    await prisma.$connect()
    
    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`)
    })

    const gracefulShutdown = async () => {
      await prisma.$disconnect()
      server.close(() => {
        process.exit(0)
      })
    }

    process.on('SIGINT', gracefulShutdown)
    process.on('SIGTERM', gracefulShutdown)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

bootstrap()