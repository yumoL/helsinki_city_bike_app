const { Station } = require('../db/model/index')
const { dumpDataFromCsv } = require('./utils')

/**
 * Fetch valid station IDs
 */
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
 * Check if a station is valid, i.e., the coordinates are valid geographic coordinate in Finland
 * @param {object} stationItem
 */
function _validateStation(stationItem) {
  const original_x = stationItem['x']
  const original_y = stationItem['y']
  const x = Number(original_x)
  const y = Number(original_y)
  // Coordinates are not numbers
  if (!x || !y) return false
  // Check if the coordinates are lying inside Finland
  return x >= 19 && x <= 32 && y >= 58 && y <= 71
  
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
  return dumpDataFromCsv({
    fileName,
    validationFunc: _validateStation,
    listMappingFunc: _mapStationList,
    bulkCreateFunc: _bulkCreateStations
  })
}

module.exports = {
  dumpStationFromCsv,
  getStationIds
}