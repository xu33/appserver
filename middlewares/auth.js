const { blowfishDecrypt, findUser } = require('../db');

module.exports = (req, res, next) => {
  const token = req.body.token;
  const json = blowfishDecrypt(token, 'shaojun');
  const { phonenumber, password } = JSON.parse(json);

  findUser(phonenumber, password).then(user => {
    if (user) {
      next();
    } else {
      res.json({
        iRet: -1,
        msg: '无效登录态'
      });
    }
  });
};
