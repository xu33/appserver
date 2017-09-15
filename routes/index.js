const express = require("express");
const multer = require("multer");
const uuid = require("uuid/v1");
const DB = require("../db");
const geolib = require("geolib");

const {
  blowfishEncrypt,
  blowfishDecrypt,
  findUser,
  createUser,
  updateUser
} = DB;
const models = require("../models");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "upload");
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${uuid()}.jpg`);
  }
});
const upload = multer({ storage });

let router = express.Router();
let verifyCodeMap = new Map();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/register", (req, res, next) => {
  let { phonenumber, password, verifyCode } = req.body;

  // if (
  //   !verifyCodeMap.has(phonenumber) ||
  //   verifyCodeMap.get(phonenumber) != verifyCode
  // ) {
  //   res.json({
  //     iRet: -1,
  //     msg: "验证码错误"
  //   });
  //   return;
  // }

  if (!phonenumber || !password) {
    res.json({
      iRet: -1,
      msg: "参数错误"
    });
    return;
  }

  verifyCodeMap.delete(phonenumber);

  createUser(phonenumber, password).spread((user, created) => {
    if (created) {
      res.json({
        iRet: 0,
        msg: "注册成功"
      });
    } else {
      res.json({
        iRet: -1,
        msg: "用户已存在"
      });
    }
  });
});

let SMSClient = require("@alicloud/sms-sdk");
let accessKeyId = "LTAIIWmvLEiGrAFm";
let secretAccessKey = "CjWmzSYORoquWZjkY13NWLSFWF19vG";
let TemplateCode = "SMS_56055145";
let smsClient = new SMSClient({ accessKeyId, secretAccessKey });

router.post("/requestVerifyCode", (req, res, next) => {
  let PhoneNumbers = req.body.phonenumber;

  if (!PhoneNumbers || String(PhoneNumbers).length < 11) {
    res.json({
      iRet: -1,
      msg: "参数错误"
    });
    return;
  }

  let verifyCode = Math.floor(Math.random() * (9999 - 999 + 1) + 999);

  verifyCodeMap.set(PhoneNumbers, verifyCode);

  smsClient
    .sendSMS({
      PhoneNumbers: String(PhoneNumbers),
      SignName: "APP",
      TemplateCode,
      TemplateParam: `{
        "code": ${verifyCode},
        "product: "APP"
      }`
    })
    .then(response => {
      let { Code } = response;
      if (Code === "OK") {
        res.json({
          iRet: 0,
          msg: "发送成功"
        });
      } else {
        return Promise.reject(new Error(Code));
      }
    })
    .catch(err => {
      res.json({
        iRet: 0,
        msg: "发送成功",
        verifyCode: verifyCode
      });
    });
});

router.post("/login", (req, res, next) => {
  let { phonenumber, password } = req.body;
  if (!phonenumber || !password) {
    res.json({
      iRet: -1,
      msg: "参数错误"
    });
  }

  findUser(req.body.phonenumber, req.body.password).then(user => {
    if (!user) {
      res.json({
        iRet: -1,
        msg: "用户名或密码错误"
      });
    } else {
      res.json({
        iRet: 0,
        token: blowfishEncrypt(
          JSON.stringify([user.id, user.password]),
          "shaojun"
        ),
        msg: "登录成功"
      });
    }
  });
});

// 编辑用户资料
router.post("/updateUser", tokenMiddleware, (req, res, next) => {
  const { nickname, sign, gender, birthday, album, position } = req.body;

  DB.updateUser(res.locals.userId, {
    nickname,
    sign,
    gender,
    birthday,
    album,
    position
  })
    .then(([rows]) => {
      if (rows > 0) {
        res.json({
          iRet: 0,
          rows: rows
        });
      } else {
        res.json({
          iRet: -1,
          msg: "记录不存在"
        });
      }
    })
    .catch(err => {
      res.json({
        iRet: -1,
        err: err
      });
    });
});

// 获取用户资料
router.get("/getUserInfo", tokenMiddleware, (req, res, next) => {
  models.User
    .findOne({
      where: {
        id: {
          $eq: res.locals.userId
        }
      }
    })
    .then(user => {
      if (!user) {
        res.json({
          iRet: -1,
          msg: "用户不存在"
        });
      } else {
        res.json({
          iRet: 0,
          data: user.get({ plain: true })
        });
      }
    });
});

// 上传照片
router.post("/upload", upload.single("photo"), (req, res, next) => {
  res.json({
    iRet: 0,
    url: req.file.filename
  });
});

// 获取附近的用户
router.get("/getNearUsers", tokenMiddleware, (req, res, next) => {
  const distance = req.query.distance || 500;
  models.User
    .findAll({
      where: {
        id: {
          $eq: res.locals.userId
        }
      }
    })
    .then(users => {
      let me;
      let others = [];

      for (let i = 0; i < users.length; i++) {
        let user = users[i];

        if (user.id == res.locals.userId) {
          me = user;
        } else {
          others.push(user);
        }
      }

      if (!me.position) {
        res.json({
          iRet: 0,
          data: []
        });
        return;
      }

      let [myLatitude, myLongtude] = me.position.split(",");
      let result = others.filter(user => {
        if (!user.position) return false;
        let [latitude, longitude] = user.position.split(",");

        let meter = geolib.getDistance(
          {
            latitude,
            longitude
          },
          {
            latitude: myLatitude,
            longitude: myLongtude
          }
        );

        return meter <= distance;
      });

      res.json({
        iRet: 0,
        data: result
      });
    });
});

// 获取群信息
router.get("/getConversationInfo", (req, res, next) => {
  DB.getConversationInfo(req.query.id).then(data => {
    if (!data) {
      res.json({
        iRet: -1
      });
    } else {
      res.json({
        iRet: 0,
        data: data
      });
    }
  });
});

function tokenMiddleware(req, res, next) {
  const token = req.header("token");

  try {
    var jsonString = blowfishDecrypt(token, "shaojun");
  } catch (e) {
    res.json({
      iRet: -1,
      msg: "token无效"
    });
    return;
  }

  const json = JSON.parse(jsonString);

  if (!token || !Array.isArray(json) || json.length < 2) {
    res.json({
      iRet: -1,
      msg: "token无效"
    });
    return;
  }

  res.locals.userId = json[0];
  next();
}

module.exports = router;
