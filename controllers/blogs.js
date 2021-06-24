const express = require('express')
const blogsRouter = express.Router()
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user')

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  if (!request.token || !request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(request.user)
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user
  })

  const result = await blog.save()
  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  if (!request.token || !request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const userId = request.user.toString()
  const blogUser = (await Blog.findById(id)).user.toString()
  if (userId === blogUser) {
    await Blog.findOneAndDelete(id)
    response.status(200).send()
  } else {
    response.status(401).send()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const blog = request.body

  const result = await Blog.findByIdAndUpdate(id, blog, { new: true })

  response.status(200).json(result)
})

module.exports = blogsRouter
