const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const User = require('../models/user')
const helper = require('./test-helper')

const api = supertest(app)


beforeEach(async () => {
  await User.deleteMany({})

  const userObjects = helper.initialUsers
    .map(user => new User(user))
  const promiseArray = userObjects.map(user => user.save())
  await Promise.all(promiseArray)
})

describe('user creation', () => {
  test('user is saved', async () => {
    const newUser = {
      username: "jorgec",
      name: "Jorge Cabrales",
      password: "jorge200"
    }

    const userResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(userResponse.body).toHaveProperty('username', newUser.username)
    expect(userResponse.body).toHaveProperty('name', newUser.name)

    const getResponse = await api.get('/api/users')

    expect(getResponse.body).toHaveLength(helper.initialUsers.length + 1)
  })

  test('example', () => {
    expect(1).toBe(1)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
