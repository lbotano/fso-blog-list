const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const api = supertest(app)
const helper = require('./test-helper')


beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await mongoose.connection.models['Blog'].createIndexes()
  await mongoose.connection.models['User'].createIndexes()

  const userObjects = helper.initialUsers
    .map(user => new User(user))
  const userPromiseArray = userObjects.map(user => user.save())
  await Promise.all(userPromiseArray)

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('user creation', () => {
  test('user is saved', async () => {
    const newUser = {
      username: 'jorgec',
      name: 'Jorge Cabrales',
      password: 'jorge200'
    }

    const userResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(userResponse.body).toHaveProperty('username', newUser.username)
    expect(userResponse.body).toHaveProperty('name', newUser.name)

    const finalUsers = await api.get('/api/users')

    expect(finalUsers.body).toHaveLength(helper.initialUsers.length + 1)
  })

  test('user with repeated username cannot be created', async () => {
    const newUser = {
      username: 'jorgec',
      name: 'Jorge Cabrera',
      password: 'jorge.200'
    }

    const repeatedUser = {
      username: 'jorgec',
      name: 'Jorge Ceciliano',
      password: 'jorge.202'
    }

    await api
      .post('/api/users')
      .send(newUser)

    await api
      .post('/api/users')
      .send(repeatedUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const finalUsers = await api.get('/api/users')

    expect(finalUsers.body).toHaveLength(helper.initialUsers.length + 1)
  })

  test('user with username of length < 3 cannot be created', async () => {
    const newUser = {
      username: 'ja',
      name: 'Jorge Artigas',
      password: 'jor.art'
    }

    await api
      .post('/api/users')
      .send(newUser)
      //.expect(400)
      .expect('Content-Type', /application\/json/)

    const finalUsers = await api.get('/api/users')

    expect(finalUsers.body).toHaveLength(helper.initialUsers.length)
  })

  test('user with password of length < 3 cannot be created', async () => {
    const newUser = {
      username: 'gonzalo',
      name: 'Gonzalo',
      password: 'go'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const finalUsers = await api.get('/api/users')

    expect(finalUsers.body).toHaveLength(helper.initialUsers.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
