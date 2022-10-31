const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const { MONGODB_URI } = require('./utils/config')
const { info, error } = require('./utils/logger')
const {
  requestLogger,
  tokenExtractor,
  userExtractor,
  errorHandler,
} = require('./utils/middleware')

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    info('Connection to MongoDB successful')
  })
  .catch((err) => {
    error(`Error while connecting to MongoDB: ${err.message}`)
  })

app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(tokenExtractor)
app.use('/api/blogs', userExtractor, blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.get('/hello', (req, res) => {
  info('hello?', req, res)
  res.send('hello')
})

app.use(errorHandler)

module.exports = app
