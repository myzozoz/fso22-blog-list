const totalLikes = (blogs) => {
  return blogs.reduce((p, c) => p + c.likes, 0)
}

const favoriteBlog = (blogs) => {
  const only_likes = blogs.map((b) => b.likes)
  const max_index = only_likes.reduce(
    (p, c, i) => (only_likes[p] < c ? i : p),
    0
  )
  return blogs[max_index]
}

const mostBlogs = (blogs) => {
  const blogsByAuthor = blogs.reduce((p, c) => {
    const a_i = p.findIndex((x) => x.author === c.author)
    if (a_i < 0) {
      return [...p, { author: c.author, blogs: 1 }]
    } else {
      const bs = [...p]
      bs[a_i].blogs++
      return bs
    }
  }, [])

  const max_index = blogsByAuthor
    .map((a) => a.blogs)
    .reduce((p, c, i) => (blogsByAuthor[p].blogs < c ? i : p), 0)

  return blogsByAuthor[max_index]
}

const mostLikes = (blogs) => {
  const likesByAuthor = blogs.reduce((p, c) => {
    const a_i = p.findIndex((x) => x.author === c.author)
    if (a_i < 0) {
      return [...p, { author: c.author, likes: c.likes }]
    } else {
      const ls = [...p]
      ls[a_i].likes += c.likes
      return ls
    }
  }, [])

  const max_index = likesByAuthor
    .map((a) => a.likes)
    .reduce((p, c, i) => (likesByAuthor[p].likes < c ? i : p), 0)

  return likesByAuthor[max_index]
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
