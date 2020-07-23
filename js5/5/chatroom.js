const fetch = require("node-fetch")

const rooms = {}

const Message = function (name, message) {
  this.name = name
  this.message = message
}

const getUserMiddleware = (req, res, next) => {
  const jwt = req.headers.authorization
  fetch("https://js5.c0d3.com/auth/api/session", {
    headers: {
      Authorization: jwt,
    },
  })
    .then((r) => r.json())
    .then((body) => {
      if (!body.error) {
        // store user info in the request
        req.user = {
          name: body.name,
          username: body.username,
          password: body.password,
        }
      }
      next()
    })
}

const getSession = (req, res) => {
  if (!req.user) {
    return res.status(403).json({error: "Invalid session"})
  }
  res.json(req.body)
}

const getMessages = (req, res) => {
  const room = req.params.room
  if (!rooms[room]) {
    console.log(`${new Date().toString()} chatroom: creating room ${room}`)
    rooms[room] = []
  }
  return res.json(rooms[room])
}

const postMessage = (req, res) => {
  const room = req.params.room
  if (!rooms[room]) {
    rooms[room] = []
  }
  rooms[room].push(new Message(req.user.name, req.body.message))
  console.log(`${new Date().toString()} chatroom: new message in room ${room} from ${req.user.name}`)
  res.sendStatus(201)
}

module.exports = {
  getUserMiddleware,
  getSession,
  getMessages,
  postMessage,
}
