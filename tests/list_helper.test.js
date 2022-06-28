const listHelper = require('../utils/list_helper')

const blog1 = {
  _id: '5a422aa71b54a676234d17f8',
  title: 'Go To Statement Considered Harmful',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
  likes: 5,
  __v: 0,
}

const blog2 = {
  _id: '5a422aa71b54a676234d1aaa',
  title: 'Second Cool Blog',
  author: 'Person McHuman',
  url: 'https://hs.fi',
  likes: 100,
  __v: 0,
}

const blog3 = {
  _id: '5aaa2aa71b54a676234d1aaa',
  title: 'Third Blog Problems',
  author: 'Tri Harder',
  url: 'https://google.com',
  likes: 2001,
  __v: 0,
}

const blog_arr = [blog1, blog2, blog3]

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

test('when array contains one blog, returns the likes of that blog', () => {
  expect(listHelper.totalLikes([blog1])).toBe(5)
})

test('can count total likes of several blogs', () => {
  expect(listHelper.totalLikes(blog_arr)).toBe(2106)
})

test('returns object with most likes from array of one', () => {
  expect(listHelper.favoriteBlog([blog1])).toEqual(blog1)
})

test('returns object with most likes from array of objects', () => {
  expect(listHelper.favoriteBlog(blog_arr)).toEqual(blog3)
})
