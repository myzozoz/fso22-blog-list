//eslint-disable-next-line
const dummy = (blogs) => {
  return 1
}

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

module.exports = {
  totalLikes,
  dummy,
  favoriteBlog,
}
