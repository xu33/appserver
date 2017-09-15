const models = require('./models');
const crypto = require('crypto');
const key = 'shaojun';
const co = require('co');

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
  try {
    var c = cipher.update(text, 'base64', 'utf8');
    c += cipher.final('utf8');
  } catch (e) {
    throw new Error('decrypt error');
  }

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

function getConversationInfo(id) {
  return co(function*() {
    let conversition = yield models.Conversation.findOne({
      where: {
        id
      }
    });

    if (!conversition) {
      return null;
    }

    let manager = yield models.User.findOne({
      where: {
        id: conversition.creator_id
      }
    });

    if (!manager) {
      return null;
    }

    let members = yield conversition.getUsers();

    return {
      conversition,
      manager,
      members
    };
  });
}

function createMessage({ userId, conversitionId, message }) {
  return co(function*() {
    let conversition = yield models.Conversation.findOne({
      where: {
        id: conversitionId
      }
    });

    conversition.addMessage({
      message
    });
  });
}

module.exports = {
  blowfishEncrypt,
  blowfishDecrypt,
  sha1,
  createUser,
  findUser,
  updateUser,
  getConversationInfo
};
