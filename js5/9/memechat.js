const path = require("path")
const gm = require("gm").subClass({ imageMagick: true })

const dir = path.resolve("./public/files")
console.log(`${new Date().toString()} memechat: dir resolved to ${dir}`)

const rooms = {}

/**
 * Returns the room object array, creating the room if it doesn't exists
 * @param {string} room - Room name
 * @returns {Object[]} Object array containing the usernames and messages
 */
const getRoom = (room) => {
  if (!rooms[room]) {
    console.log(`${new Date().toString()} memechat: creating room ${room}`)
    rooms[room] = []
  }
  return rooms[room]
}

/**
 * Sends a JSON with all the messages in the queried room
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const getMessages = (req, res) => {
  const room = getRoom(req.params.room)
  return res.json(room)
}

/**
 * Inserts a new message in the queried room
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const postMessage = (req, res) => {
  const room = getRoom(req.params.room)
  const username = req.session.username
  const message = req.body.message
  room.push({ username, message })
  console.log(`${new Date().toString()} memechat: new message in room ${req.params.room} from ${username}`)
  res.sendStatus(201)
}

/**
 * Saves a new image file to the server, edited with the provided text
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const postImage = (req, res) => {
  const img = Buffer.from(req.body.img, "base64")
  gm(img)
    .fontSize(70)
    .stroke("#ffffff")
    .drawText(0, 200, req.body.meme)
    .write(`${dir}/${req.session.username}.png`, (err) => {
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
