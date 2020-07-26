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
  console.log(`${new Date().toString()} commands: running "${command} ${args.join(' ')}"`)
  execFile(command, args, (error, stdout, stderr) => {
    if (error) {
      console.error(`${new Date().toString()} commands: ${error}`)
      return res.send(JSON.stringify({ output: error }))
    }
    if (stderr) {
      console.error(`${new Date().toString()} commands: ${stderr}`)
      return res.send(JSON.stringify({ output: stderr }))
    }
    res.send(JSON.stringify({ output: stdout }))
  })
}

module.exports = {
  runCommand,
}
