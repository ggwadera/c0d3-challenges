const Jimp = require("jimp")
const fetch = require('node-fetch')

const cache = {}

const cacheImage = (src, image) => {
  if (!cache[src]) {
    cache[src] = { image: image }
  }
  cache[src].timestamp = Date.now()
  if (Object.keys(cache).length > 10) {
    const oldest = Object.keys(cache).reduce((prev, cur) => {
      return prev.timestamp < cur.timestamp ? prev : cur
    })
    delete cache[oldest]
  }
}

const genMeme = async (req, res) => {
  const text = req.params.text
  const blur = parseInt(req.query.blur) || 0
  const src = req.query.src || "https://placeimg.com/640/480/any"
  const black = req.query.black == "true"

  const font = await Jimp.loadFont(
    black ? Jimp.FONT_SANS_32_BLACK : Jimp.FONT_SANS_32_WHITE
  )

  try {
    const image = cache[src] ? cache[src].image : await Jimp.read(src)
    console.log(`memegem: src="${src}"; text="${text}"; blur="${blur}"; black="${black}"`)
    const mime = image.getMIME()
    cacheImage(src, image)

    if (blur > 0) {
      image.blur(blur)
    }

    image.print(font, 0, 0, text)
    image.getBuffer(mime, (err, buffer) => {
      res.set("content-type", mime)
      res.send(buffer)
    })
  } catch (e) {
    res.send("Error while processing the requested image.<br>" + e)
  }
}

const test = () => {
    for (let i = 0; i < 15; i++) {
        const url = `http://localhost:8123/memegen/api/test?src=https://placeimg.com/${500 + i * 10}/600/any`
        console.log(i, url)
        fetch(url).then(console.log('test ' + i))
    }
}

module.exports = {
  genMeme,
  test
}
