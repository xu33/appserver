module.exports = (sequelize, DataTypes) => {
  let User = sequelize.define("User", {
    nickname: DataTypes.STRING,
    phonenumber: DataTypes.STRING,
    password: DataTypes.STRING,
    gender: DataTypes.INTEGER,
    album: DataTypes.TEXT,
    birthday: DataTypes.DATE,
    sign: DataTypes.TEXT
  });

  return User;
};
