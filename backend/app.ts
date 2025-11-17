import Fastify from 'fastify'
import authRoutes from './routes/auth.routes.js'

const app = Fastify()

app.register(authRoutes)

export default app
