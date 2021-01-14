const Sequelize = require('sequelize')
const sequelize = new Sequelize('node-js-shop', 'root', '1234', {dialect: 'mysql'})


module.exports = sequelize

