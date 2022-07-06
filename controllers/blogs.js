const blogRouter = require('express').Router()
const { info } = require('console')
const Blog = require('../models/blog')

blogRouter.get('/info', (request, response) => {
  info('Info fetched')
  response.status(200).send('Yes hello everything OK welcome to blogs service')
})

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  if (!blog.likes) {
    blog.likes = 0
  }
  const result = await blog.save()
  response.status(201).json(result)
})

module.exports = blogRouter
