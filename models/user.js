module.exports = (sequelize, DataTypes) => {
  let User = sequelize.define('User', {
    nickname: DataTypes.STRING,
    phonenumber: DataTypes.STRING,
    password: DataTypes.STRING,
    gender: DataTypes.STRING,
    phonenumber: DataTypes.STRING,
    avatar: DataTypes.STRING
  });

  return User;
};
