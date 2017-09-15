const models = require("./models");
const utils = require("util");
const db = require("./db");
// models.sequelize.sync({ force: true }).then(async () => {
//   let user = await models.User.findOne({
//     where: {
//       id: 1
//     }
//   });

//   let conversitions = await user.getConversations();
// });

// (async () => {
//   await models.sequelize.sync();

// const result = await db.createMessage({
//   message: "suck",
//   UserId: 1,
//   ConversationId: 1
// });

// const result = await db.getConversationInfo(3);

// console.log(utils.inspect(result, false, 5));

// const result = await db.createConversation({
//   title: "草拟吗比",
//   UserId: 1,
//   pid: 0
// });

// console.log(result);
// })();

async function fuck() {
  return 1;
}

fuck().then(n => console.log(n));
