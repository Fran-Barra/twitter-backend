import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createServer } from 'http'

import { Constants, NodeEnv, Logger, swaggerOptions, withAuth, socketAuth } from '@utils'
import { router } from '@router'
import { ErrorHandling } from '@utils/errors'
import swaggerJsdoc from 'swagger-jsdoc'
import * as swaggerUi from 'swagger-ui-express'
import { Server, Socket } from 'socket.io'
import { onConnectionStarted } from '@domains/chat/service/chat.socket.io.service'

const app = express()

// Set up request logger
if (Constants.NODE_ENV === NodeEnv.DEV) {
  app.use(morgan('tiny')) // Log requests only in development environments
  const specs = swaggerJsdoc(swaggerOptions);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
  )
}

// Set up request parsers
app.use(express.json()) // Parses application/json payloads request bodies
app.use(express.urlencoded({ extended: false })) // Parse application/x-www-form-urlencoded request bodies
app.use(cookieParser()) // Parse cookies

// Set up CORS
app.use(
  cors({
    origin: Constants.CORS_WHITELIST
  })
)

app.use('/api', router)

app.use(ErrorHandling)



const httpServer = createServer(app)
//TODO: use specific path
const io = new Server(httpServer)

io.use(socketAuth)
io.on("connection", onConnectionStarted)


httpServer.listen(Constants.PORT, () => {
  Logger.info(`Server listening on port ${Constants.PORT}`)
})

