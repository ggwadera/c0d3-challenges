const fs = require("fs")

const FILE_LIFETIME = 1000 * 60 * 5 // 5 minutes

const path = __dirname + "/files/"
const files = {} // store files and last modified time

const findAll = (req, res) => {
  res.send(JSON.stringify(Object.keys(files)))
}

const findFile = (req, res) => {
  const filename = req.params.filename
  console.log(`assets: fetching file ${filename}`)
  if (!files.hasOwnProperty(filename)) return res.statusStatus(404)
  fs.readFile(path + filename, "utf-8", (err, data) => {
    if (err) {
      return res.send("Error reading file.")
    }
    res.send(JSON.stringify(data))
  })
}

const createFile = (req, res) => {
  const filename = req.body.filename
  const content = req.body.content
  fs.writeFile(path + filename, content, () => {
    files[filename] = Date.now()
    res.sendStatus(201)
  })
}

const deleteOldFiles = () => {
  const maxTime = Date.now() - FILE_LIFETIME
  console.log(`assets: checking for old files`)
  Object.keys(files).forEach((file) => {
    if (files[file] < maxTime) {
      fs.unlink(path + file, () => {
        console.log(`assets: deleted file ${file}`)
        delete files[file]
      })
    }
  })
}

const initialize = () => {
  fs.readdir(path, (err, data) => {
    if (!data) return
    data.forEach((file) => {
      fs.stat(path + file, (err, stats) => {
        files[file] = stats.mtimeMs
      })
    })
  })
  setInterval(deleteOldFiles, 1000 * 60) // checks every minute
}

module.exports = {
  findAll,
  findFile,
  createFile,
  initialize,
}
