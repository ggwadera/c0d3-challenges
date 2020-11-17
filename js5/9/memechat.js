const path = require('path');
const Jimp = require('jimp');

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
const postImage = async (req, res) => {
  const { img, meme } = req.body;
  const { username } = req.session;
  const buffer = Buffer.from(img, 'base64');
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  return Jimp.read(buffer)
    .then((image) => image
      .resize(480, 480)
      .print(font, 0, 0, {
        text: meme,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
      }, 480)
      .writeAsync(`${dir}/${username}.${image.getExtension()}`))
    .then(() => {
      room[username] = `/files/${username}.png`;
      return res.sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      return res.sendStatus(500);
    });
};

module.exports = {
  getUsers,
  postImage,
};
