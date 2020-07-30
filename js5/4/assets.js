const fs = require('fs');

const FILE_LIFETIME = 1000 * 60 * 5; // 5 minutes

const path = `${__dirname}/files/`;
const files = {}; // store files and last modified time

/**
 * Sends a JSON with all the files info
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const findAll = (req, res) => {
  res.send(JSON.stringify(Object.keys(files)));
};

/**
 * Sends back the contents of the file in the request parameter
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const findFile = (req, res) => {
  const { filename } = req.params;
  console.log(`${new Date().toString()} assets: fetching file ${filename}`);
  if (!files[filename]) return res.statusStatus(404);
  return fs.readFile(path + filename, 'utf-8', (err, data) => {
    if (err) {
      return res.send('Error reading file.');
    }
    return res.send(JSON.stringify(data));
  });
};

/**
 * Writes a new file on the server with the name and contents in the request body
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const createFile = (req, res) => {
  const { filename } = req.body;
  const { content } = req.body;
  console.log(`${new Date().toString()} assets: writing file ${filename}`);
  fs.writeFile(path + filename, content, () => {
    files[filename] = Date.now();
    res.sendStatus(201);
  });
};

/**
 * Deletes files older than FILE_LIFETIME
 */
const deleteOldFiles = () => {
  if (Object.keys(files).length > 0) {
    const maxTime = Date.now() - FILE_LIFETIME;
    console.log(`${new Date().toString()} assets: checking for old files`);
    Object.keys(files).forEach((file) => {
      if (files[file] < maxTime) {
        fs.unlink(path + file, () => {
          console.log(`${new Date().toString()} assets: deleted file ${file}`);
          delete files[file];
        });
      }
    });
  }
};

/**
 * Initializes the files object with the files that already exists
 */
const initialize = () => {
  fs.readdir(path, (err, data) => {
    if (!data) return;
    data.forEach((file) => {
      fs.stat(path + file, (err2, stats) => {
        files[file] = stats.mtimeMs;
      });
    });
  });
  setInterval(deleteOldFiles, 1000 * 60 * 5); // checks every 5 minutes
};

module.exports = {
  findAll,
  findFile,
  createFile,
  initialize,
};
