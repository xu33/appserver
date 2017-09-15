module.exports = (sequelize, DataTypes) => {
  let Conversation = sequelize.define('Conversation', {
    title: DataTypes.STRING,
    creator_id: DataTypes.INTEGER,
    pid: DataTypes.INTEGER
  });

  Conversation.associate = function(models) {
    Conversation.belongsToMany(models.User, {
      through: 'UserConversation'
    });
  };

  return Conversation;
};
