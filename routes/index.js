var express = require('express');
var router = express.Router();
var verifyCodeMap = new Map();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

const { blowfishEncrypt, findUser, createUser } = require('../db');
const models = require('../models');

router.post('/register', (req, res, next) => {
  let { phonenumber, password, verifyCode } = req.body;

  if (
    !verifyCodeMap.has(phonenumber) ||
    verifyCodeMap.get(phonenumber) != verifyCode
  ) {
    res.json({
      iRet: -1,
      msg: '验证码错误'
    });
    return;
  }

  if (!phonenumber || !password) {
    res.json({
      iRet: -1,
      msg: '参数错误'
    });
    return;
  }

  verifyCodeMap.delete(phonenumber);

  createUser(phonenumber, password).spread((user, created) => {
    if (created) {
      res.json({
        iRet: 0,
        msg: '注册成功'
      });
    } else {
      res.json({
        iRet: -1,
        msg: '用户已存在'
      });
    }
  });
});

let SMSClient = require('@alicloud/sms-sdk');
let accessKeyId = 'LTAIIWmvLEiGrAFm';
let secretAccessKey = 'CjWmzSYORoquWZjkY13NWLSFWF19vG';
let TemplateCode = 'SMS_56055145';
let smsClient = new SMSClient({ accessKeyId, secretAccessKey });

router.post('/requestVerifyCode', (req, res, next) => {
  let PhoneNumbers = req.body.phonenumber;

  if (!PhoneNumbers || String(PhoneNumbers).length < 11) {
    res.json({
      iRet: -1,
      msg: '参数错误'
    });
    return;
  }

  let verifyCode = Math.floor(Math.random() * (9999 - 999 + 1) + 999);

  verifyCodeMap.set(PhoneNumbers, verifyCode);

  smsClient
    .sendSMS({
      PhoneNumbers: String(PhoneNumbers),
      SignName: 'APP',
      TemplateCode,
      TemplateParam: `{
        "code": ${verifyCode},
        "product: "APP"
      }`
    })
    .then(response => {
      let { Code } = response;
      if (Code === 'OK') {
        res.json({
          iRet: 0,
          msg: '发送成功'
        });
      } else {
        return Promise.reject(new Error(Code));
      }
    })
    .catch(err => {

      console.log(err);
      res.json({
        iRet: -1,
        msg: '发送失败'
      });


      // res.json({
      //   iRet: 0,
      //   msg: '发送成功',
      //   verifyCode: verifyCode
      // });
    });
});

router.post('/login', (req, res, next) => {
  let { phonenumber, password } = req.body;
  if (!phonenumber || !password) {
    res.json({
      iRet: -1,
      msg: '参数错误'
    });
  }

  findUser(req.body.phonenumber, req.body.password).then(user => {
    if (!user) {
      res.json({
        iRet: -1,
        msg: '用户名或密码错误'
      });
    } else {
      res.json({
        iRet: 0,
        token: blowfishEncrypt(
          JSON.stringify([user.phonenumber, user.password]),
          'shaojun'
        ),
        msg: '登录成功'
      });
    }
  });
});

module.exports = router;
