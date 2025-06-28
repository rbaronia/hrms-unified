const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const config = require('../config/config');

// Adjust this config as needed for your environment
const dbConf = config.database;
const sequelize = new Sequelize(
  dbConf.database,
  dbConf.user,
  dbConf.password,
  {
    host: dbConf.host,
    port: dbConf.port,
    dialect: dbConf.dialect,
    logging: false,
    pool: dbConf.pool,
    ssl: dbConf.ssl,
    dialectOptions: dbConf.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Example User model (add more as needed)
db.User = sequelize.define('User', {
  firstname: DataTypes.STRING,
  lastname: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  streetaddr: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zipcode: DataTypes.STRING,
  title: DataTypes.STRING,
  manager: DataTypes.INTEGER,
  ismanager: DataTypes.BOOLEAN,
  edulevel: DataTypes.STRING,
  status: DataTypes.STRING,
  deptid: DataTypes.INTEGER,
  typeid: DataTypes.INTEGER,
  userid: DataTypes.STRING,
  date_modified: DataTypes.DATE,
}, {
  tableName: 'USER',
  timestamps: false
});

module.exports = db;
