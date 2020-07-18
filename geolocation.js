const fetch = require("node-fetch")
const fs = require("fs")

const visitors = []
const visitorCount = {}
const visitorsRoute = (req, res) => {
  const ip = req.get("x-forwarded-for")
  fetch(`https://js5.c0d3.com/location/api/ip/${ip}`)
    .then((response) => response.json())
    .then((body) => {
      visitors.push(body)
      visitorCount[body.cityStr] = (visitorCount[body.cityStr] || 0) + 1
      fs.readFile(__dirname + "/geolocation.html", "utf8", (err, html) => {
        if (err) {
          throw err
        }
        const visitorsHtml = Object.keys(visitorCount).reduce((acc, e) => {
          return `${acc}<li class="list-group-item">${e} - ${visitorCount[e]}</li>`
        }, "")
        html = html.replace("{cityStr}", body.cityStr)
        html = html.replace("{visitors}", visitorsHtml)
        html = html.replace("{lat,lng}", `lat: ${body.ll[0]}, lng: ${body.ll[1]}`)
        res.send(html)
      })
    })
}

const findAll = (req, res) => {
  res.set('content-type', 'application/json')
  res.send(JSON.stringify(visitors))
}

module.exports = {
  visitorsRoute,
  findAll,
}
