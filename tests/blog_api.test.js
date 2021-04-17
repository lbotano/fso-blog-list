const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test-helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('all blogs have the "id" property', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0]).toHaveProperty('id')
})

test('blog is saved', async () => {
  const newBlog = {
    title: 'How to make egg',
    author: 'William Williams',
    url: 'https://www.google.com/search?q=How+to+make+egg',
    likes: 151
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // Check if blog has correct data
  expect(response.body)
    .toMatchObject(newBlog)

  // Check if the total amount of blogs increased
  const responseGet = await api.get('/api/blogs')
  expect(responseGet.body).toHaveLength(helper.initialBlogs.length + 1)
})

test('blog has 0 likes if not specified', async () => {
  const newBlog = {
    title: 'How to make egg',
    author: 'William Williams',
    url: 'https://www.google.com/search?q=How+to+make+egg'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  expect(response.body)
    .toHaveProperty('likes', 0)
})

test('blog with no title or url is not saved', async () => {
  const newBlog = {
    author: 'John Doe',
    likes: 43
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('delete a single blog', async () => {
  const response = await api.get('/api/blogs')
  const postId = response.body[0].id

  await api
    .delete(`/api/blogs/${postId}`)
    .expect(200)

  const responseFinal = await api.get('/api/blogs')
  expect(responseFinal.body).toHaveLength(helper.initialBlogs.length - 1)
})

test('update a single blog', async () => {
  const modifiedBlog = {
    likes: 700,
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/'
  }

  const response = await api.get('/api/blogs')
  const postId = response.body[0].id

  const putResponse = await api
    .put(`/api/blogs/${postId}`)
    .send(modifiedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(putResponse.body).toMatchObject(modifiedBlog)
})

afterAll(() => {
  mongoose.connection.close()
})
