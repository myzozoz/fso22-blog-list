const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')

describe('when blogs already exist', () => {
  let token
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()

    await Blog.deleteMany({})

    const blogs = helper.initialBlogs.map((b) => ({ ...b, user: user._id }))
    await Blog.insertMany(blogs)

    const userForToken = {
      username: user.username,
      id: user._id,
    }
    token = jwt.sign(userForToken, process.env.SECRET)
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
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`)
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

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(testBlog)
      .expect(400)
  })

  test('blog with no url is not added', async () => {
    const testBlog = {
      title: 'Testing and Related Tropical Diseases',
      author: 'Carlos McMuffin',
      likes: 2,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(testBlog)
      .expect(400)
  })

  test('can delete post by id', async () => {
    await api
      .delete(`/api/blogs/${helper.initialBlogs[0]._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

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
    expect(blog).toEqual(expect.objectContaining(newBlog))
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'make',
      name: 'Markus Holopainen',
      password: 'salis',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is not given', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain(
      'Password must exist and have at least three characters'
    )
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'a',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain(
      'Password must exist and have at least three characters'
    )
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
