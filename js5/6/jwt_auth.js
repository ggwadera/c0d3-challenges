const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")

const saltRounds = 10
const jwtSecret = "super ultra mega secret"

// Store users in memory (cleared at server restart)
// Using objects to keep references to the users objects
// And have constant time search by id, username or email
const usersById = {}
const usersByUsername = {}
const usersByEmail = {}

/**
 * Validates the user input and creates a new token for the user
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const postUser = (req, res) => {
  const data = req.body
  const username = data.username
  const password = data.password
  const email = data.email

  // Convert base64 length to original string length
  const passwordLength =
    3 * Math.ceil(password.length / 4) - (password.match(/=/g) || []).length

  // Validate inputs
  if (passwordLength < 5) {
    return res
      .status(400)
      .json({ error: "Password must have at least 5 characters." })
  }
  if (!username.match(/\w+$/)) {
    return res
      .status(400)
      .json({
        error:
          "Username must not be blank and only contain letters and numbers.",
      })
  }
  if (!email.match(/^\S+@\S+$/)) {
    return res.status(400).json({ error: "Invalid email." })
  }
  if (usersByEmail.hasOwnProperty(email)) {
    return res.status(400).json({ error: "This email already exists." })
  }
  if (usersByUsername.hasOwnProperty(username)) {
    return res.status(400).json({ error: "This username already exists." })
  }

  // Hash password and create user
  bcrypt
    .hash(password, saltRounds)
    .then((hash) => {
      data.password = hash
      data.id = uuidv4()
      data.token = jwt.sign({ id: data.id }, jwtSecret)
      const user = Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})
      console.log(`${new Date().toString()} auth: new user ${user.username}`)
      usersById[user.id] = user
      usersByUsername[user.username] = user
      usersByEmail[user.email] = user
      return res.status(201).json({ jwt: user.token })
    })
    .catch((err) => {
      return res.sendStatus(500)
    })
}

/**
 * Validates the user password with the stored hash and sends the JWT if valid
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const postSession = (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const user = usersByUsername[username]

  if (!user) {
    return res.status(400).json({ error: "Username does not exist." })
  }

  bcrypt.compare(password, user.password).then((match) => {
    if (!match) {
      return res.status(400).json({ error: "Invalid password" })
    }
    console.log(`${new Date().toString()} auth: user ${user.username} login`)
    return res.json({ jwt: user.token })
  })
}

/**
 * Validates the user token
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const getSession = (req, res) => {
  const token = req.headers.authorization.split(" ")[1]
  const decoded = jwt.decode(token)
  const id = decoded ? decoded.id : null

  if (!usersById[id]) {
    return res.status(400).json({ error: "Invalid token" })
  }
  console.log(
    `${new Date().toString()} auth: user ${usersById[id].username} session`
  )
  return res.json(usersById[id].token)
}

module.exports = {
  postUser,
  postSession,
  getSession,
}
