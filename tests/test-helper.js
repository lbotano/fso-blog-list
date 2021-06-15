const bcrypt = require('bcrypt')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    user: '607ef18d5111d988409d5863',
    __v: 0
  }
]

const initialUsers = [
  {
    username: 'lbotano',
    name: 'Lautaro Bernabé Otaño',
    password: 'lautaro200',
    __v: 0
  },
  {
    username: 'djdsm',
    name: 'San Martín',
    password: 'sanmartin200',
    __v: 0
  },
  {
    username: 'jmbelgrano',
    name: 'Juan Manuel Belgrano',
    password: 'belgrano500',
    __v: 0
  },
  {
    username: 'lbotano2',
    name: 'Lautaro Bernabé Otaño',
    password: 'lautaro200',
    __v: 0
  }
]

const passwordToHash = async (password) => await bcrypt.hash(password, 10)

module.exports = {
  initialBlogs,
  initialUsers,
  passwordToHash
}
