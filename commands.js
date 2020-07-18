const { execFile } = require("child_process")

const allowedCommands = {
  ls: true,
  pwd: true,
  cat: true,
}

const runCommand = (req, res) => {
  const input = req.body.command.split(" ")
  const command = input.shift()
  const args = input
  if (!allowedCommands[command]) {
    return res.send(JSON.stringify({ output: "Command not allowed." }))
  }
  console.log("Running: ", command, args)
  execFile(command, args, (error, stdout, stderr) => {
    if (error) {
      console.log("Execution Error", error)
      return res.send(JSON.stringify({ output: error }))
    }
    if (stderr) {
      console.log("Error (stderr)", stderr)
      return res.send(JSON.stringify({ output: stderr }))
    }
    res.send(JSON.stringify({ output: stdout }))
  })
}

module.exports = {
  runCommand,
}
