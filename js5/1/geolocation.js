const fetch = require("node-fetch")
const fs = require("fs")

const visitors = {}
const visitorCount = {}
const visitorsRoute = (req, res) => {
  const ip = req.get("x-forwarded-for")
  if (visitors[ip]) {
    return renderPage(req, res, visitors[ip])
  }
  fetch(`https://js5.c0d3.com/location/api/ip/${ip}`)
    .then((response) => response.json())
    .then((body) => {
      console.log(`${new Date().toString()} geolocation: adding IP ${ip} from ${body.cityStr}`)
      visitors[ip] = body
      renderPage(req, res, body)
    })
}

const renderPage = (req, res, body) => {
  visitorCount[body.cityStr] = (visitorCount[body.cityStr] || 0) + 1
  fs.readFile(__dirname + "/geolocation.html", "utf8", (err, html) => {
    if (err) {
      throw err
    }
    const visitorsHtml = Object.keys(visitorCount).reduce((acc, e, i) => {
      return `${acc}
        <tr>
          <td>${e}</td>
          <td>${visitorCount[e]}</td>
        </tr>
    `
      // return `${acc}<li class="list-group-item">${e} - ${visitorCount[e]}</li>`
    }, "")
    html = html.replace("{cityStr}", body.cityStr)
    html = html.replace("{ip}", body.ip)
    html = html.replace("{visitors}", visitorsHtml)
    html = html.replace("{lat,lng}", `lat: ${body.ll[0]}, lng: ${body.ll[1]}`)
    res.send(html)
  })
}

const findAll = (req, res) => {
  res.set("content-type", "application/json")
  res.send(JSON.stringify(visitors))
}

const mock = () => {
  fs.readFile(__dirname + "/mockIPs.txt", "utf-8", (err, data) => {
    if (err) {
      return console.error("Error reading file", error)
    }
    console.log('STARTING MOCK IP REQUESTS')
    const ips = data.split("\n")
    ips.forEach((ip) => {
      fetch(`https://js5.c0d3.com/location/api/ip/${ip}`)
        .then((response) => response.json())
        .then((body) => {
          console.log(`Adding IP ${ip} from ${body.cityStr}`)
          visitors[ip] = body
          visitorCount[body.cityStr] = (visitorCount[body.cityStr] || 0) + 1
          // renderPage(req, res, body)
        })
    })
    console.log('ENDING MOCK IP REQUESTS\n')
  })
}
module.exports = {
  visitorsRoute,
  findAll,
  mock,
}
