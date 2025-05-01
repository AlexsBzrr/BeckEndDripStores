const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
  },
};
