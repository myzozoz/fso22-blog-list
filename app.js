const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const blogRouter = require('./controllers/blogs')
const { MONGODB_URI } = require('./utils/config')
const { info, error } = require('./utils/logger')
const { requestLogger } = require('./utils/middleware')

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
app.use('/api/blogs', blogRouter)

app.get('/hello', (req, res) => {
  info('hello?', req, res)
  res.send('hello')
})

module.exports = app
