module.exports = (sequelize, DataTypes) => {
  let Message = sequelize.define('Message', {
    message: DataTypes.TEXT
  });

  Message.associate = function(models) {
    Message.belongsTo(models.User);
    Message.belongsTo(models.Conversation);
  };

  return Message;
};
