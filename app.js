const express = require("express")
const geolocation = require("./geolocation")
const commands = require("./commands")

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

// 2. COMMANDS
app.get("/commands", (req, res) => {
  res.sendFile(__dirname + "/commands.html")
})

app.post('/commands', (req, res) => {
  commands.runCommand(req, res)
})

app.listen(process.env.PORT || 8123)
