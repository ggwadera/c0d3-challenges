const express = require("express")
const session = require("express-session")
const multer = require("multer")

const geolocation = require("./js5/1/geolocation")
const commands = require("./js5/2/commands")
const memegen = require("./js5/3/memegen")
const assets = require("./js5/4/assets")
const chatroom = require("./js5/5/chatroom")
const auth = require("./js5/6/jwt_auth")
const ocr = require("./js5/7/ocr")
const webcam = require("./js5/8/webcam")
const memechat = require("./js5/9/memechat")

const app = express()
const upload = multer({ dest: "public/files/" })
const port = process.env.PORT || 8123

app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: false, cookie: { maxAge: 1000*60*60, sameSite: true } })) // cookie
app.use(express.static("public")) // generate static link to files in /public
app.use(express.json({ limit: "10mb" })) // parse json body in the requests

// 1. IP GEOLOCATION
app.get("/visitors", (req, res) => {
  geolocation.visitorsRoute(req, res)
})

app.get("/api/visitors", (req, res) => {
  geolocation.findAll(req, res)
})
// geolocation.mock()

// 2. COMMANDS
// app.get("/commands", (req, res) => {
//   res.sendFile(__dirname + "public/js5/2/commands.html")
// })

app.post("/commands", (req, res) => {
  commands.runCommand(req, res)
})

// 3. Meme Gen
app.get("/memegen/api/:text", (req, res) => {
  memegen.genMeme(req, res)
})

// 4. Asset Creation
app.get("/api/files", (req, res) => {
  assets.findAll(req, res)
})

app.get("/api/files/:filename", (req, res) => {
  assets.findFile(req, res)
})

app.post("/api/files", (req, res) => {
  assets.createFile(req, res)
})
assets.initialize()

// 5. Chatroom using JWT Auth
app.get("/chatroom/:room?", (req, res) => {
  res.sendFile(__dirname + "/public/js5/5/chatroom.html")
})

app.use("/chatroom/api/*", (req, res, next) => {
  chatroom.getUserMiddleware(req, res, next)
})

app.get("/chatroom/api/session", (req, res) => {
  chatroom.getSession(req, res)
})

app.get("/chatroom/api/:room/messages", (req, res) => {
  chatroom.getMessages(req, res)
})

app.post("/chatroom/api/:room/messages", (req, res) => {
  chatroom.postMessage(req, res)
})

// 6. Authentication
app.get("/auth", (req, res) => {
  res.sendFile(__dirname + "/public/js5/6/auth.html")
})

app.post("/auth/api/users", (req, res) => {
  auth.postUser(req, res)
})

app.post("/auth/api/session", (req, res) => {
  auth.postSession(req, res)
})

app.get("/auth/api/session", (req, res) => {
  auth.getSession(req, res)
})

// 7. Image Text Extraction
app.post("/ocr/files", upload.single("userFile"), (req, res) => {
  ocr.postJob(req, res)
})

app.get("/ocr/job/:jobid", (req, res) => {
  res.sendFile(__dirname + "/public/js5/7/ocr_job.html")
})

app.get("/ocr/api/job/:jobid", (req, res) => {
  ocr.getJob(req, res)
})
ocr.deleteOldFiles()

// 8. Selfie Queen
app.post("/webcam/files", (req, res) => {
  webcam.postImage(req, res)
})
webcam.deleteOldFiles()

// 9. MemeChat
app.get("/memechat/:room?", (req, res) => {
  res.sendFile(__dirname + "/public/js5/9/memechat.html")
})

app.get("/memechat/api/session", (req, res) => {
  if (!req.session.username) {
    return res.status(403).json({ error: "Invalid session" })
  }
  res.sendStatus(200)
})

app.post("/memechat/api/session", (req, res) => {
  if (!req.session.username) {
    req.session.username = req.body.username
  }
  res.sendStatus(201)
})

app.get("/memechat/api/:room/messages", (req, res) => {
  memechat.getMessages(req, res)
})

app.post("/memechat/api/:room/messages", (req, res) => {
  memechat.postMessage(req, res)
})

app.post("/memechat/api/files", (req, res) => {
  memechat.postImage(req, res)
})

// Start server
app.listen(port, () => {
  if (!process.env.PORT) {
    console.log(`Server running at http://localhost:${port}`)
  }
})
