const Sequelize = require('sequelize')
const { MYSQL_CONF } = require('../config/db')
const { isTest } = require('../utils/env')

const { host, user, password, database } = MYSQL_CONF
const conf = {
  host: host,
  dialect: 'mysql'
}

// don't print sql queries when in testing env (defaulted to console.log)
if(isTest) {
  conf.logging = () => {}
}

const seq = new Sequelize(database, user, password, conf)

module.exports = seq