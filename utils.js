const fs = require('fs');
const path = require('path');

const dir = path.resolve('./');

// Create files folder if it not exists
const createFolder = () => {
  const exists = fs.existsSync(`${dir}/public/files`);
  if (!exists) {
    fs.mkdirSync(`${dir}/public/files`, { recursive: true });
  }
};

const cleanFolder = () => {
  const fullPath = path.resolve(`${dir}/public/files`);
  fs.readdir(fullPath, (err, files) => {
    if (err) throw err;
    files.forEach((file) => fs.unlink(path.join(fullPath, file), () => {}));
  });
};

module.exports = {
  createFolder,
  cleanFolder,
};
