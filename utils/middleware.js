const jwt = require('jsonwebtoken')

const logger = require('./logger')

const errorHandler = (error, request, response, next) => {
  logger.error(`${error.name}: ${error.message}`)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'MongoError') {
    if (error.code === 11000) {
      return response.status(400).send({ error: error.message })
    }
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    request.user = decodedToken.id
  }

  next()
}

module.exports = {
  errorHandler,
  tokenExtractor
}
