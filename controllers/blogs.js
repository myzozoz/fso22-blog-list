const blogRouter = require('express').Router()
const { info } = require('console')
const Blog = require('../models/blog')

blogRouter.get('/info', (request, response) => {
  info('Info fetched')
  response.status(200).send('Yes hello everything OK welcome to blogs service')
})

blogRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

blogRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)
  blog.save().then((result) => {
    response.status(201).json(result)
  })
})

module.exports = blogRouter
