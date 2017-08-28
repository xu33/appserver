var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

let verifyCodeMap = new Map();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

const { blowfishEncrypt, findUser, createUser } = require('./db');
const models = require('./models');

app.post('/register', (req, res, next) => {
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

app.post('/requestVerifyCode', (req, res, next) => {
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
      console.log(err.message);
      res.json({
        iRet: -1,
        msg: '发送失败'
      });
    });
});

app.post('/login', (req, res, next) => {
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
