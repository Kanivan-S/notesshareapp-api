//use bit.io for relational database
const dotenv = require('dotenv');
dotenv.config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_CONNECTION);
module.exports = sequelize;