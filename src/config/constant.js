const { isTest } = require('../utils/env')
module.exports = {
  MAX_FILE_SIZE: 150, //MB
  CHUNK_SIZE: 500000,
  PAGE_SIZE: isTest ? 3 : 25
}