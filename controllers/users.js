const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
require('express-async-errors')

const User = require('../models/user')


usersRouter.post('/', async (request, response) => {
  const body = request.body

  if (!('password' in body)) {
    response.status(400).json({ error: 'password is required' })
  }
  else if (body.password.length < 3) {
    response.status(400).json({ error: 'password too short' })
  } else {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash: passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  response.json(users)
})

module.exports = usersRouter
