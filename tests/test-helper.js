const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    user: '607ef18d5111d988409d5863',
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
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
    _id: '607ef18d5111d988409d5863',
    username: 'lbotano',
    name: 'Lautaro Bernabé Otaño',
    password: 'lautaro200',
    __v: 0
  },
  {
    _id: '607ef18d5111d988409d5864',
    username: 'djdsm',
    name: 'San Martín',
    password: 'sanmartin200',
    __v: 0
  },
  {
    _id: '607ef18d5111d988409d5865',
    username: 'jmbelgrano',
    name: 'Juan Manuel Belgrano',
    password: 'belgrano500',
    __v: 0
  },
  {
    _id: '607ef18d5111d988409d5866',
    username: 'lbotano2',
    name: 'Lautaro Bernabé Otaño',
    password: 'lautaro200',
    __v: 0
  }
]

module.exports = {
  initialBlogs,
  initialUsers
}
