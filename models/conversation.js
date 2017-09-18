module.exports = (sequelize, DataTypes) => {
  let Conversation = sequelize.define('Conversation', {
    title: DataTypes.STRING,
    pid: DataTypes.INTEGER
  });

  Conversation.associate = function(models) {
    Conversation.belongsToMany(models.User, {
      through: 'UserConversation'
    });

    Conversation.belongsTo(models.User, {
      foreignKey: 'creator_id',
      as: 'creator'
    });
  };

  return Conversation;
};
