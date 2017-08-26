module.exports = process.env.NODE_ENV === "production"
  ? require("./config.development")
  : require("./config.development");
