const { Station } = require('../db/model/index')
const { dumpDataFromCsv } = require('./utils')

/**
 * Create a station
 * @param {Object} station attributes {sid, name, address, city, operator, capacity, x, y}
 * @returns 
 */
// async function createStation({ sid, name, address, city, operator, capacity, x, y }) {
//   const result = await Station.create({
//     sid,
//     name,
//     address,
//     city,
//     operator,
//     capacity,
//     x,
//     y
//   })
//   return result.dataValues
// }

/**
 * Create stations in bulk
 * @param {Array} stationList 
 */
// async function createBulkStation(stationList) {
//   await Station.bulkCreate(stationList)
// }

async function getStationIds() {
  let res = await Station.findAll({
    attributes: ['sid']
  })
  let sids = []
  res.map(station => station.dataValues)
    .forEach(station => {
      sids.push(station.sid)
    })
  return new Set(sids)
}

/**
 * Map a station chunk that contains raw station data to a structured station list where data properties are according to the Station model
 * @param {Array} stationChunk
 */
function _mapStationList(stationChunk) {
  return stationChunk.map(stationItem => {
    return {
      sid: parseInt(stationItem['ID']),
      name: stationItem['Name'],
      address: stationItem['Osoite'],
      city: stationItem['Kaupunki'] !== '' ? stationItem['Kaupunki'] : null,
      operator: stationItem['Operaattor'] !== '' ? stationItem['Operaattor'] : null,
      capacity: parseInt(stationItem['Kapasiteet']),
      x: Number(stationItem['x']),
      y: Number(stationItem['y'])
    }
  })
}

/**
 * Create a function that save stations in bulk
 * @param {Array} stationList 
 */
function _bulkCreateStations(stationList) {
  return Station.bulkCreate(stationList)
}

/**
 * Dump station data from a single csv file to the database
 * @param {string} fileName csv file path
 */
function dumpStationFromCsv(fileName) {
  return dumpDataFromCsv(fileName, _mapStationList, _bulkCreateStations)
}

module.exports = {
  dumpStationFromCsv,
  getStationIds
}
