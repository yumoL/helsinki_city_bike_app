const { isTest } = require('../utils/env')

let MYSQL_CONF = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  port: 3306,
  database: 'city_bike_db'
}

if (isTest) {
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    port: 3306,
    database: 'city_bike_test_db'
  }
}

module.exports = {
  MYSQL_CONF
}