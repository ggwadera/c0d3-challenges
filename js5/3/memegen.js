const Jimp = require('jimp');

const cache = {}; // last 10 images cache

/**
 * Caches the image and deletes the oldest one if there's more than 10
 * @param {string} src - Image source URL
 * @param {} image - Image object from Jimp
 */
const cacheImage = (src, image) => {
  if (!cache[src]) {
    cache[src] = { image };
  }
  cache[src].timestamp = Date.now();
  if (Object.keys(cache).length > 10) {
    const oldest = Object.keys(cache)
      .reduce((prev, cur) => (prev.timestamp < cur.timestamp ? prev : cur));
    delete cache[oldest];
  }
};

/**
 * Generates a meme with the parameters in the request
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const genMeme = async (req, res) => {
  const { text } = req.params;
  const blur = parseInt(req.query.blur, 10) || 0;
  const src = req.query.src || 'https://placeimg.com/640/480/any';
  const black = req.query.black === 'true';

  const font = await Jimp.loadFont(
    black ? Jimp.FONT_SANS_32_BLACK : Jimp.FONT_SANS_32_WHITE,
  );

  try {
    const image = cache[src] ? cache[src].image : await Jimp.read(src);
    const mime = image.getMIME() || Jimp.MIME_JPEG; // defaults to "image/jpeg" if cannot get MIME
    console.log(`memegem: src="${src}"; text="${text}"; blur="${blur}"; black="${black}"; mime="${mime}"`);
    cacheImage(src, image);

    if (blur > 0) {
      image.blur(blur);
    }

    image.print(font, 0, 0, text);
    image.getBuffer(mime, (err, buffer) => {
      res.set('content-type', mime);
      res.send(buffer);
    });
  } catch (e) {
    console.log(`memegen: Error processing image from src="${src}"\n${e}`);
    res.send(`Error while processing the requested image.<br>${e}`);
  }
};

module.exports = {
  genMeme,
};
