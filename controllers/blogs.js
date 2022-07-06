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
  const result = await blog.save()
  response.status(201).json(result)
})

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes: request.body.likes },
    {
      new: true,
    }
  )
  response.json(updatedBlog)
})

module.exports = blogRouter
