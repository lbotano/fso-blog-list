const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const helper = require('./test-helper')
const config = require('../utils/config')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeAll(async (done) => {
  jest.setTimeout(15000)
  mongoose.connect(
    config.MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    }
  )
    .then(() => {
      done()
    })
    .catch((error) => {
      console.error('Error connecting to test MongoDB:', error.message)
    })
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  let userObjects = helper.initialUsers
  userObjects = await Promise.all(userObjects.map(async (user) => {
    return {
      ...user, password: await helper.passwordToHash(user.password)
    }
  }))
  userObjects = userObjects.map(user =>
    new User({
      username: user.username,
      name: user.name,
      passwordHash: user.password
    })
  )
  const userPromiseArray = userObjects.map(user => user.save())
  await Promise.all(userPromiseArray)
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

describe('user creation', () => {
  test('creates a user', async () => {
    const newUser = {
      username: 'saavedra',
      name: 'Cornelio Saavedra',
      password: 'patricio'
    }

    const passwordHash = await helper.passwordToHash(newUser.password)

    const savedUser = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(savedUser.body).toMatchObject({
      username: newUser.username,
      name: newUser.name
    })
  })

  test('throws error when user has no username', async () => {
    const newUser = {
      name: 'Cornelio Saavedra',
      password: 'patricio'
    }

    const savedUser = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(savedUser.body.error)
      .toEqual('User validation failed: username: Path `username` is required.')
  })

  test('throws error when user has no password', async () => {
    const newUser = {
      username: 'saavedra',
      name: 'Cornelio Saavedra'
    }

    const savedUser = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(savedUser.body.error)
      .toEqual('password is required')
  })

  test('throws error when user password has < 3 characters', async () => {
    const newUser = {
      username: 'saavedra',
      name: 'Cornelio Saavedra',
      password: '1a'
    }

    const savedUser = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(savedUser.body.error)
      .toEqual('password too short')
  })

  test('throws error when username has < 3 characters', async () => {
    const newUser = {
      username: 'sa',
      name: 'Cornelio Saavedra',
      password: 'patricio'
    }

    const savedUser = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(savedUser.body.error)
      .toEqual('User validation failed: username: Path `username` (`sa`) is shorter than the minimum allowed length (3).')
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})
