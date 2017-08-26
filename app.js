var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var routes = require("./routes/index");
var users = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/users", users);

const { blowfishEncrypt, findUser, createUser } = require("./db");
const models = require("./models");

app.post("/register", (req, res, next) => {
  createUser(req.body.nickname, req.body.password).spread((user, created) => {
    if (created) {
      res.json({
        iRet: 0,
        msg: "注册成功"
      });
    } else {
      res.json({
        iRet: -1,
        msg: "用户名已存在"
      });
    }
  });
});

app.post("/login", (req, res, next) => {
  findUser(req.body.nickname, req.body.password).then(user => {
    if (!user) {
      res.json({
        iRet: -1,
        msg: "用户名或密码错误"
      });
    } else {
      res.json({
        iRet: 0,
        token: blowfishEncrypt(
          JSON.stringify([user.nickname, user.password]),
          "shaojun"
        ),
        msg: "登录成功"
      });
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});

module.exports = app;
