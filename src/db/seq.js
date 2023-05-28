const Sequelize = require('sequelize')
const { MYSQL_CONF } = require('../config/db')
const { isProd } = require('../utils/env')

const { host, user, password, database } = MYSQL_CONF
let conf = {
  host: host,
  dialect: 'mysql',
  logging: () => {}
}

if (isProd) {
  conf.pool = {
    max: 5,
    min: 0,
    idle: 10000 //release the connection if it has not been used for 10s
  }
}

// don't print sql queries when in testing env (defaulted to console.log)
// if(isTest) {
//   conf.logging = () => {}
// }

const seq = new Sequelize(database, user, password, conf)

module.exports = seq