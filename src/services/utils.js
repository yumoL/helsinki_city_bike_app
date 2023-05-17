const fs = require('fs')
const csv = require('csv-parser')
const { CHUNK_SIZE } = require('../config/constant')

/**
 * Dump data from a single csv file db
 * @param {string} fileName csv file path
 * @param {function} listMappingFunc The function that maps raw data get from the csv file to structured data whose properties are according to its db model
 * @param {function} bulkCreateFunc The function that saves data to db in bulk
 */
function dumpDataFromCsv(fileName, listMappingFunc, bulkCreateFunc) {

  return new Promise((resolve, reject) => {
    let dataChunk = []
    let promiseArr = []
    fs.createReadStream(fileName)
      .pipe(csv(
        { //remove the leading and trailing spaces from headers
          mapHeaders: ({ header, index }) => header.trim()
        }
      ))
      .on('data', (data) => {
        dataChunk.push(data)
      })
      .on('end', async () => {

        let list = await listMappingFunc(dataChunk)

        for (let i = 0; i < list.length; i += CHUNK_SIZE) {
          promiseArr.push(bulkCreateFunc(list.slice(i, i + CHUNK_SIZE)))
        }
        resolve(promiseArr)

      })
      .on('error', (err) =>reject(err))
  })
}

module.exports = {
  dumpDataFromCsv
}
