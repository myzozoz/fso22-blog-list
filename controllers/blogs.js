const blogRouter = require('express').Router()
const { info } = require('console')
const Blog = require('../models/blog')

blogRouter.get('/info', (request, response) => {
  info('Info fetched')
  response.status(200).send('Yes hello everything OK welcome to blogs service')
})

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const user = request.user

  const blog = new Blog({ ...request.body, user: user._id })
  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()

  response.status(201).json(result)
})

blogRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const user = request.user

  if (user.id.toString() == blog.user.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    const err = new Error()
    err.name = 'JsonWebTokenError'
    throw err
  }
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
