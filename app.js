const express = require("express")
const geolocation = require("./1/geolocation")
const commands = require("./2/commands")

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
app.get("/commands", (req, res) => {
  res.sendFile(__dirname + "/2/commands.html")
})

app.post('/commands', (req, res) => {
  commands.runCommand(req, res)
})

app.listen(process.env.PORT || 8123)
