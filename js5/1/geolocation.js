const fetch = require("node-fetch")
const fs = require("fs")

const visitors = {} // cache visitors by IP
const visitorCount = {} // keep counter by city

/**
 * GET route to get the user location from IP
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
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

/**
 * Renders the HTML page by replacing some parts with info from the user
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {Object} body - JSON containg info from the user IP
 */
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

/**
 * GET route for the API, sends back a JSON with all the visitors info
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const findAll = (req, res) => {
  res.set("content-type", "application/json")
  res.send(JSON.stringify(visitors))
}

/**
 * Function to mock requests from random IPs to populate the list
 */
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
