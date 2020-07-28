const { execFile } = require("child_process")

/**
 * List of allowed commands to run on the server
 */
const allowedCommands = {
  ls: true,
  pwd: true,
  cat: true,
}

/**
 * Runs the command on the server with Node.js's child_process.execFile,
 * this way, there's less risk of command injection with "&&" or similar,
 * because execFile takes the command as the first parameter and inteprets
 * the remaining commands as arguments to the command.
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
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
