const fetch = require('node-fetch');
const fs = require('fs');

const visitors = {}; // cache visitors by IP
const visitorCount = {}; // keep counter by city

/**
 * Renders the HTML page by replacing some parts with info from the user
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {Object} body - JSON containg info from the user IP
 */
const renderPage = (req, res, body) => {
  visitorCount[body.cityStr] = (visitorCount[body.cityStr] || 0) + 1;
  fs.readFile(`${__dirname}/geolocation.html`, 'utf8', (err, html) => {
    if (err) {
      throw err;
    }
    const visitorsHtml = Object.keys(visitorCount).reduce((acc, e) => `${acc}
        <tr>
          <td>${e}</td>
          <td>${visitorCount[e]}</td>
        </tr>
    `, '');
    let newHtml = html.replace('{cityStr}', body.cityStr);
    newHtml = html.replace('{ip}', body.ip);
    newHtml = html.replace('{visitors}', visitorsHtml);
    newHtml = html.replace('{lat,lng}', `lat: ${body.ll[0]}, lng: ${body.ll[1]}`);
    res.send(newHtml);
  });
};

/**
 * GET route to get the user location from IP
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const visitorsRoute = (req, res) => {
  const ip = req.get('x-forwarded-for');
  if (visitors[ip]) {
    return renderPage(req, res, visitors[ip]);
  }
  return fetch(`https://js5.c0d3.com/location/api/ip/${ip}`)
    .then((response) => response.json())
    .then((body) => {
      console.log(`${new Date().toString()} geolocation: adding IP ${ip} from ${body.cityStr}`);
      visitors[ip] = body;
      renderPage(req, res, body);
    });
};

/**
 * GET route for the API, sends back a JSON with all the visitors info
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const findAll = (req, res) => {
  res.set('content-type', 'application/json');
  res.send(JSON.stringify(visitors));
};

module.exports = {
  visitorsRoute,
  findAll,
};
