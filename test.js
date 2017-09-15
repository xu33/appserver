const models = require('./models');

models.sequelize.sync().then(async () => {
  let user = await models.User.findOne({
    where: {
      id: 1
    }
  });

  let conversitions = await user.getConversations();

  console.log(conversitions);
});
