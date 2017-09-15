const models = require("./models");
const crypto = require("crypto");
const key = "shaojun";
const co = require("co");

// DES 加密
function blowfishEncrypt(message, key) {
  key = key.length >= 8
    ? key.slice(0, 8)
    : key.concat("0".repeat(8 - key.length));
  const keyHex = new Buffer(key);
  const cipher = crypto.createCipheriv("blowfish", keyHex, keyHex);
  let c = cipher.update(message, "utf8", "base64");
  c += cipher.final("base64");
  return c;
}

// DES 解密
function blowfishDecrypt(text, key) {
  key = key.length >= 8
    ? key.slice(0, 8)
    : key.concat("0".repeat(8 - key.length));
  const keyHex = new Buffer(key);
  const cipher = crypto.createDecipheriv("blowfish", keyHex, keyHex);
  try {
    var c = cipher.update(text, "base64", "utf8");
    c += cipher.final("utf8");
  } catch (e) {
    throw new Error("decrypt error");
  }

  return c;
}

function sha1(str) {
  let hash = crypto.createHash("sha1");
  hash.update(str);
  return hash.digest("hex");
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

async function getConversationInfo(id) {
  let conversition = await models.Conversation.findOne({
    include: [
      {
        model: models.User
      }
    ],
    where: {
      id
    }
  });

  let admin = await models.User.findOne({
    where: {
      id: conversition.creator_id
    }
  });

  let result = conversition.get({ plain: true });
  result.admin = admin.get({ plain: true });

  return result;
}

async function createMessage({ UserId, ConversationId, message }) {
  return await models.Message.create({
    message,
    UserId,
    ConversationId
  });
}

// 创建群
async function createConversation({ UserId, title, pid }) {
  let conversation = await models.Conversation.create({
    creator_id: UserId,
    title: title,
    pid: pid ? pid : 0
  });

  let user = await models.User.findOne({
    where: {
      id: UserId
    }
  });

  await user.addConversation(conversation);

  return conversation.get({ plain: true });
}

module.exports = {
  blowfishEncrypt,
  blowfishDecrypt,
  sha1,
  createUser,
  findUser,
  updateUser,
  getConversationInfo,
  createMessage,
  createConversation
};
