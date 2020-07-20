const express = require("express")
const geolocation = require("./js5/1/geolocation")
const commands = require("./js5/2/commands")
const memegen = require("./js5/3/memegen")
const assets = require('./js5/4/assets')

const app = express()
app.use(express.static("public"))
app.use(express.json())

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname + "/index.html"))
// })

// 1. IP GEOLOCATION
app.get("/visitors", (req, res) => {
  geolocation.visitorsRoute(req, res)
})

app.get("/api/visitors", (req, res) => {
  geolocation.findAll(req, res)
})
geolocation.mock()

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

app.listen(process.env.PORT || 8123)
