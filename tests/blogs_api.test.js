const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blogs have id field', async () => {
  const response = await api.get('/api/blogs')
  const blog = response.body[0]
  expect(blog.id).toBeDefined()
})

test('can add valid blog', async () => {
  const testBlog = {
    title: 'Testing and Related Tropical Diseases',
    author: 'Carlos McMuffin',
    url: 'http://blog.cleaasdfasefasdf.com',
    likes: 2,
  }
  await api
    .post('/api/blogs')
    .send(testBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()
  expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
  expect(blogs).toContainEqual(expect.objectContaining(testBlog))
})

test('blog with no likes gets 0 likes as default', async () => {
  const testBlog = {
    title: 'Testing and Related Tropical Diseases',
    author: 'Carlos McMuffin',
    url: 'http://blog.cleaasdfasefasdf.com',
  }

  await api
    .post('/api/blogs')
    .send(testBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()
  expect(blogs).toContainEqual(
    expect.objectContaining({ ...testBlog, likes: 0 })
  )
})

afterAll(() => {
  mongoose.connection.close()
})
