const models = require('./models');
const util = require('util');
const db = require('./db');

(async () => {
  await models.sequelize.sync();

  // const result = await db.createMessage({
  //   message: "suck",
  //   UserId: 1,
  //   ConversationId: 1
  // });

  // const result = await db.getConversationInfo(1);

  // console.log(util.inspect(result, false, 5));

  // const result = await db.createConversation({
  //   title: "草拟吗比",
  //   UserId: 1,
  //   pid: 0
  // });

  // console.log(result);
  // try {
  //   let messages = await db.getMessages({ ConversationId: 1 });
  //   console.log(messages);
  // } catch (e) {
  //   console.log(e);
  // }

  // let arr = await models.Conversation.findAll({
  //   where: {
  //     id: 1
  //   },
  //   attributes: ['title'],
  //   include: [
  //     {
  //       model: models.User,
  //       as: 'creator',
  //       attributes: ['id', 'nickname', 'album']
  //     },
  //     {
  //       model: models.User,
  //       attributes: ['id', 'nickname', 'album']
  //     }
  //   ]
  // });

  // arr = arr.map(o => o.get({ plain: true }));

  // console.log(util.inspect(arr, false, 5));

  let result = await db.getMessages({ ConversationId: 1 });
  console.log(result);
})();
