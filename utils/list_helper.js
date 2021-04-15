const _ = require('lodash')

const dummy = (posts) => {
  return 1
}

const totalLikes = (posts) => {
  return posts.length === 0
    ? 0
    : posts.map(post => post.likes)
    .reduce((accu, likes) => accu + likes)
}

const favoriteBlog = (posts) => {
  return posts.length === 0
    ? {}
    : posts.reduce((max, post) => max.likes > post.likes ? max : post)
}

const mostBlogs = (posts) => {
  // Blogs of the author with the most blogs
  const blogsOfAuthor =
    _.orderBy(
      _.values(_.groupBy(posts, 'author')),
    [function(o) { return o.length; }], ['desc'])[0]

  return posts.length === 0
    ? {}
    : {
      author: blogsOfAuthor[0].author,
      blogs: blogsOfAuthor.length
    }
}

const mostLikes = (posts) => {
  const blogsOfAuthor =
    _.orderBy(
      _.values(_.groupBy(posts, 'author')),
    [function(o) { return _.sumBy(o, 'likes') }], ['desc'])[0]

  return posts.length === 0
    ? {}
    : {
      author: blogsOfAuthor[0].author,
      likes: _.sumBy(blogsOfAuthor, 'likes')
    }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
