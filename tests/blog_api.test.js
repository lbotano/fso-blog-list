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
  // Clean database
  await Blog.deleteMany({})
  await User.deleteMany({})

  const userPassword = await helper.passwordToHash('michael')
  // Add user that creates blogs
  const blogUser = await new User({
    username: 'theUser',
    name: 'The User',
    passwordHash: userPassword
  }).save()
  await Promise.all(
    helper.initialBlogs.map((blog) => {
      blog.user = blogUser._id.toString()
      return new Blog(blog).save()
    })
  )

  // Add users
  let userObjects = helper.initialUsers
  userObjects = await Promise.all(userObjects.map(async (user) => {
    return {
      ...user, passwordHash: await helper.passwordToHash(user.password)
    }
  }))
  userObjects = userObjects.map(user =>
    new User({
      username: user.username,
      name: user.name,
      passwordHash: user.passwordHash
    })
  )

  const userPromiseArray = userObjects.map(user => user.save())
  await Promise.all(userPromiseArray)
})

describe('blogs', () => {
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('all blogs have the "id" property', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0]).toHaveProperty('id')
  })

  test('blog is saved', async () => {
    const token = (await api
      .post('/api/login')
      .send({ username: 'lbotano', password: 'lautaro200' }))
      .body.token

    const newBlog = {
      title: 'How to make egg',
      author: 'William Williams',
      url: 'https://www.google.com/search?q=How+to+make+egg',
      likes: 151
    }

    const response = await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
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
    const token = (await api
      .post('/api/login')
      .send({ username: 'lbotano', password: 'lautaro200' }))
      .body.token

    const newBlog = {
      title: 'How to make egg',
      author: 'William Williams',
      url: 'https://www.google.com/search?q=How+to+make+egg'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body)
      .toHaveProperty('likes', 0)
  })

  test('blog with no title or url is not saved', async () => {
    const token = (await api
      .post('/api/login')
      .send({ username: 'lbotano', password: 'lautaro200' }))
      .body.token

    const newBlog = {
      author: 'John Doe',
      likes: 43
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('owner can delete blog', async () => {
    const token = (await api
      .post('/api/login')
      .send({ username: 'theUser', password: 'michael' })
      .expect(200))
      .body.token

    const response = await api.get('/api/blogs')
    const postId = response.body[0].id

    await api
      .delete(`/api/blogs/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const responseFinal = await api.get('/api/blogs')
    expect(responseFinal.body).toHaveLength(helper.initialBlogs.length - 1)
  })

  test('cannot delete others blog', async () => {
    const token = (await api
      .post('/api/login')
      .send({ username: 'lbotano', password: 'lautaro200' }))
      .body.token

    const response = await api.get('/api/blogs')
    const postId = response.body[0].id

    await api
      .delete(`/api/blogs/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
  })

  test('cannot blog without credentials', async () => {
    const response = await api.get('/api/blogs')
    const postId = response.body[0].id

    await api
      .delete(`/api/blogs/${postId}`)
      .expect(401)
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

  test('blog has user info', async () => {
    const response = await api.get('/api/blogs')
    const user = response.body[0].user

    expect(user).toMatchObject({
      username: 'theUser',
      name: 'The User'
    })
  })
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

describe('user token authorization', () => {
  test('generates token', async () => {
    const correctInfo = {
      username: 'lbotano',
      password: 'lautaro200'
    }

    const token = await api
      .post('/api/login')
      .send(correctInfo)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(token.body.username).toBe(correctInfo.username)
    expect(token.body.name).toBe('Lautaro Bernabé Otaño')
    expect(token.body.token).toBeDefined()
    expect(token.body.token).not.toBe('')
  })

  test('rejects wrong password', async () => {
    const wrongInfo = {
      username: 'lbotano',
      password: 'lautaro201'
    }

    const token = await api
      .post('/api/login')
      .send(wrongInfo)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(token.body).toEqual({
      error: 'invalid username or password'
    })
  })

  test('rejects non-existent user', async () => {
    const wrongInfo = {
      username: 'fdsafdsafŋ¶ŧ®dað¢Æ§ÐŦ',
      password: 'fasdfdsa'
    }

    const token = await api
      .post('/api/login')
      .send(wrongInfo)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(token.body).toEqual({
      error: 'invalid username or password'
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
