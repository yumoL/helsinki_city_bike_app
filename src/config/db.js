const { isTest, isProd } = require('../utils/env')

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
} else if (isProd) {
  MYSQL_CONF = {
    host: 'mysql',
    user: 'root',
    password: 'password',
    port: 3306,
    database: 'city_bike_db'
  }
}

module.exports = {
  MYSQL_CONF
}