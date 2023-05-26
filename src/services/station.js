const { Station, Journey } = require('../db/model/index')
const { dumpDataFromCsv } = require('./utils')
const { PAGE_SIZE } = require('../config/constant')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

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

/**
 * Fetch station list
 * @param {string} keyword keyword used in like search by name
 * @param {number} pageIndex 
 * @param {number} pageSize 
 */
async function getStationList({ keyword, pageIndex, pageSize = PAGE_SIZE }) {
  let whereOpt = {}
  if (keyword) {
    whereOpt = {
      name: {
        [Op.like]: `%${keyword}%`
      }
    }
  }
  const result = await Station.findAndCountAll({
    where: whereOpt,
    attributes: ['sid', 'name', 'address', 'city'],
    limit: pageSize,
    offset: pageSize * pageIndex,
    order: [
      ['sid', 'asc']
    ],
  })
  let stationList = result.rows.map(row => row.dataValues)
    .map(row => {
      row.city = row.city.trim().length > 0 ? row.city : 'Helsinki'
      return row
    })
  return {
    count: result.count,
    pageSize,
    stationList
  }
}

/**
 * Get a single station by sid
 * @param {integer} sid 
 * @param {integer} monthIndex 0 for Jan and 11 for Dec
 * @returns 
 */
async function getStationBySid(sid, monthIndex = -1) {
  let journeyOpt = {}
  if (monthIndex >= 0 && monthIndex <= 11) {
    journeyOpt = {
      departureTime: {
        [Op.and]: [
          { [Op.gte]: new Date(Date.UTC(2021, monthIndex, 1)) },
          { [Op.lt]: new Date(Date.UTC(2021, monthIndex + 1, 1)) }
        ]
      }
    }
  }
  const result = await Station.findOne({
    where: { sid },
    attributes: ['sid', 'name', 'address', 'capacity', 'x', 'y'],
    include: [
      {
        model: Journey,
        where: journeyOpt,
        attributes: ['id', 'departureTime', 'returnStationId', 'distance', 'duration'],
        as: 'departures',
        //to spped up the query, set separate to true to run a separate query to fetch the associated instances, 
        //note: only supported for hasMany associations
        separate: true,
        include: [
          {
            model: Station,
            attributes: ['name'],
            as: 'returnStation',
          }
        ] 
      },
      {
        model: Journey,
        where: journeyOpt,
        attributes: ['id', 'departureStationId', 'distance', 'duration'],
        as: 'returns',
        separate: true,
        include: [
          {
            model: Station,
            attributes: ['name'],
            as: 'departureStation',
          }
        ] 
      }
    ]
  })
  //console.log(result.dataValues)
  return result.dataValues
}

module.exports = {
  dumpStationFromCsv,
  getStationIds,
  getStationList,
  getStationBySid
}
