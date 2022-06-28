const app = require('./app') // varsinainen Express-sovellus
const { info } = require('./utils/logger')
const { PORT } = require('./utils/config')
const http = require('http')

const server = http.createServer(app)

server.listen(PORT, () => {
  info(`Server running on port ${PORT}`)
})
