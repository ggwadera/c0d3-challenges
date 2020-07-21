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
        req.body.name = body.name
        req.body.username = body.username
        req.body.password = body.password
      }
      next()
    })
}

const getSession = (req, res) => {
  if (!req.body.username) {
    return res.sendStatus(403)
  }
  res.json(req.body)
}

const getMessages = (req, res) => {
  const room = req.params.room
  if (!rooms[room]) {
    rooms[room] = []
  }
  return res.json(rooms[room])
}

const postMessage = (req, res) => {
  const room = req.params.room
  if (!rooms[room]) {
    rooms[room] = []
  }
  rooms[room].push(new Message(req.body.name, req.body.message))
  res.sendStatus(201)
}

module.exports = {
  getUserMiddleware,
  getSession,
  getMessages,
  postMessage,
}
