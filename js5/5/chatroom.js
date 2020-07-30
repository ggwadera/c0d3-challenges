const fetch = require('node-fetch');

const rooms = {};

/**
 * Authenticates the user session from the JWT using a third-party server.
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {Function} next - Next route in the path
 */
const getUserMiddleware = (req, res, next) => {
  const jwt = req.headers.authorization;
  fetch('https://js5.c0d3.com/auth/api/session', {
    headers: {
      Authorization: jwt,
    },
  })
    .then((r) => r.json())
    .then((body) => {
      if (!body.error) {
        // store user info in the request
        req.user = {
          name: body.name,
          username: body.username,
          password: body.password,
        };
      }
      next(); // calls the next route
    });
};

/**
 * Validates the user session
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const getSession = (req, res) => {
  if (!req.user) {
    return res.status(403).json({ error: 'Invalid session' });
  }
  return res.json(req.body);
};

/**
 * Sends a JSON with all the messages of the queried room
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const getMessages = (req, res) => {
  const { room } = req.params;
  if (!rooms[room]) {
    console.log(`${new Date().toString()} chatroom: creating room ${room}`);
    rooms[room] = [];
  }
  return res.json(rooms[room]);
};

/**
 * Posts a new message in the specified room
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const postMessage = (req, res) => {
  const { room } = req.params;
  if (!rooms[room]) {
    rooms[room] = [];
  }
  rooms[room].push({ name: req.user.name, message: req.body.message });
  console.log(`${new Date().toString()} chatroom: new message in room ${room} from ${req.user.name}`);
  res.sendStatus(201);
};

module.exports = {
  getUserMiddleware,
  getSession,
  getMessages,
  postMessage,
};
