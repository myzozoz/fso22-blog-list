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

test('blog with no title is not added', async () => {
  const testBlog = {
    author: 'Carlos McMuffin',
    url: 'http://blog.cleaasdfasefasdf.com',
    likes: 2,
  }

  await api.post('/api/blogs').send(testBlog).expect(400)
})

test('blog with no url is not added', async () => {
  const testBlog = {
    title: 'Testing and Related Tropical Diseases',
    author: 'Carlos McMuffin',
    likes: 2,
  }

  await api.post('/api/blogs').send(testBlog).expect(400)
})

test('can delete post by id', async () => {
  await api.delete(`/api/blogs/${helper.initialBlogs[0]._id}`).expect(204)

  const blogs = await helper.blogsInDb()

  expect(blogs).toHaveLength(helper.initialBlogs.length - 1)

  expect(blogs).not.toContainEqual(
    expect.objectContaining({
      title: helper.initialBlogs[0].title,
      author: helper.initialBlogs[0].author,
      url: helper.initialBlogs[0].url,
    })
  )
})

test('can update likes', async () => {
  const newBlog = {
    id: helper.initialBlogs[0]._id,
    title: helper.initialBlogs[0].title,
    author: helper.initialBlogs[0].author,
    url: helper.initialBlogs[0].url,
    likes: helper.initialBlogs[0].likes * 2,
  }
  await api.put(`/api/blogs/${newBlog.id}`).send(newBlog).expect(200)

  const blogs = await helper.blogsInDb()
  expect(blogs).toHaveLength(helper.initialBlogs.length)
  const blog = await helper.blogById(newBlog.id)
  expect(blog).toEqual(newBlog)
})

afterAll(() => {
  mongoose.connection.close()
})
