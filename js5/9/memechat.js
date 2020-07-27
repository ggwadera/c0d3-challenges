const fs = require("fs")
const path = require("path")
const gm = require("gm").subClass({ imageMagick: true })
const { v4: uuidv4 } = require("uuid")

const dir = path.resolve("./public")
console.log(`${new Date().toString()} memechat: dir resolved to ${dir}`)

const rooms = {}

const getRoom = (room) => {
  if (!rooms[room]) {
    console.log(`${new Date().toString()} memechat: creating room ${room}`)
    rooms[room] = []
  }
  return rooms[room]
}

const getMessages = (req, res) => {
  const room = getRoom(req.params.room)
  return res.json(room)
}

const postMessage = (req, res) => {
  const room = getRoom(req.params.room)
  const username = req.session.username
  const message = req.body.message
  room.push({ username, message })
  console.log(`${new Date().toString()} memechat: new message in room ${req.params.room} from ${username}`)
  res.sendStatus(201)
}

const postImage = (req, res) => {
  const img = Buffer.from(req.body.img, "base64")
  gm(img)
    .fontSize(70)
    .stroke("#ffffff")
    .drawText(0, 200, req.body.meme)
    .write(`${dir}/files/${req.session.username}.png`, (err) => {
      if (err) {
        console.error(err)
        return res.sendStatus(500)
      }
      console.log(`${new Date().toString()} memechat: new image ${req.session.username}.png`)
      res.sendStatus(201)
    })
}

module.exports = {
  getMessages,
  postMessage,
  postImage
}
