const models = require('./models');
const crypto = require('crypto');
const key = 'shaojun';

// DES 加密
function blowfishEncrypt(message, key) {
  key =
    key.length >= 8 ? key.slice(0, 8) : key.concat('0'.repeat(8 - key.length));
  const keyHex = new Buffer(key);
  const cipher = crypto.createCipheriv('blowfish', keyHex, keyHex);
  let c = cipher.update(message, 'utf8', 'base64');
  c += cipher.final('base64');
  return c;
}

// DES 解密
function blowfishDecrypt(text, key) {
  key =
    key.length >= 8 ? key.slice(0, 8) : key.concat('0'.repeat(8 - key.length));
  const keyHex = new Buffer(key);
  const cipher = crypto.createDecipheriv('blowfish', keyHex, keyHex);
  let c = cipher.update(text, 'base64', 'utf8');
  c += cipher.final('utf8');
  return c;
}

function sha1(str) {
  let hash = crypto.createHash('sha1');
  hash.update(str);
  return hash.digest('hex');
}

function createUser(phonenumber, password) {
  return models.User.findOrCreate({
    where: {
      phonenumber
    },
    defaults: {
      password: sha1(password)
    }
  });
}

function findUser(phonenumber, password) {
  return models.User.find({
    where: {
      phonenumber,
      password: sha1(password)
    }
  });
}

function updateUser(id, fields) {
  let vaildFields = {};

  for (let key in fields) {
    if (fields[key] !== undefined) {
      vaildFields[key] = fields[key];
    }
  }

  return models.User.update(vaildFields, {
    where: {
      id
    }
  });
}

module.exports = {
  blowfishEncrypt,
  sha1,
  createUser,
  findUser,
  updateUser
};
