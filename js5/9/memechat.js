const path = require('path');
const gm = require('gm').subClass({ imageMagick: true });

const dir = path.resolve('./public/files');
console.log(`${new Date().toString()} memechat: dir resolved to ${dir}`);

const room = {};

/**
 * Sends a JSON with all the users in the room
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const getUsers = (req, res) => res.json(room);

/**
 * Saves a new image file to the server, edited with the provided text
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const postImage = (req, res) => {
  const img = Buffer.from(req.body.img, 'base64');
  const { username } = req.session;
  return gm(img)
    .fontSize(70)
    .stroke('#ffffff')
    .drawText(0, 200, req.body.meme)
    .write(`${dir}/${username}.png`, (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      room[username] = `/files/${username}.png`;
      console.log(`${new Date().toString()} memechat: new image from ${username}.png`);
      return res.sendStatus(201);
    });
};

module.exports = {
  getUsers,
  postImage,
};
