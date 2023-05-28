const { Journey, Station } = require('../db/model/index')
const { getStationIds } = require('./station')
const { dumpDataFromCsv } = require('./utils')
const { PAGE_SIZE } = require('../config/constant')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

/**
 * Check if a journey is valid
 * @param {Set} stationIds a list of valid station IDs 
 */
function _validateJourney(stationIds) {
  function validate(journeyItem) {
    const departureTime = new Date(journeyItem['Departure'])
    const returnTime = new Date(journeyItem['Return'])
    const departureStationId = parseInt(journeyItem['Departure station id'])
    const returnStationId = parseInt(journeyItem['Return station id'])
    const distance = Number(journeyItem['Covered distance (m)'])
    const duration = Number(journeyItem['Duration (sec.)'])

    // Departure and arrivel time should be parseable DateTime
    if (isNaN(departureTime) || isNaN(returnTime)) return false

    // Arrival time should be after departure time
    if (returnTime < departureTime) return false

    // Departure and arrival station id should be valid
    if (!departureStationId
      || !returnStationId
      || !stationIds.has(departureStationId)
      || !stationIds.has(returnStationId))
      return false

    // Distance and duration should be valid
    return distance && duration && distance >= 10 && duration >= 10

  }
  return validate

}

/**
 * Map a journey chunk that contains raw journey data to a structured journey list where data properties are according to the Journey model
 * @param {Array} journeyChunk
 */
function _mapJourneyList(journeyChunk) {
  return journeyChunk
    .map(journeyItem => {
      return {
        departureTime: journeyItem['Departure'],
        returnTime: journeyItem['Return'],
        departureStationId: parseInt(journeyItem['Departure station id']),
        returnStationId: parseInt(journeyItem['Return station id']),
        distance: Number(journeyItem['Covered distance (m)']),
        duration: Number(journeyItem['Duration (sec.)'])
      }
    })
}

/**
 * Create a function that save journeys in bulk
 * @param {Array} journeyList 
 */
function _bulkCreateJourneys(journeyList) {
  return Journey.bulkCreate(journeyList)
}

/**
 * Dump station data from a single csv file to the database
 * @param {string} fileName csv file path
 */
async function dumpJourneyFromCsv(fileName) {
  const stationIds = await getStationIds()
  return dumpDataFromCsv({
    fileName,
    validationFunc: _validateJourney(stationIds),
    listMappingFunc: _mapJourneyList,
    bulkCreateFunc: _bulkCreateJourneys
  })
}

/**
 * Parse sequelize order criteria
 * @param {Object} orderObj  
 */
function _parseOrderOpt(orderObj) {
  if (!orderObj) return [['id', 'ASC']]
  let orderArr = []
  let sortingOrder = orderObj.order === 0 ? 'DESC' : 'ASC'
  if (orderObj.name === 'departureStation' || orderObj.name === 'returnStation') {
    orderArr.push([Sequelize.col(`${orderObj.name}.name`), sortingOrder])
  } else {
    orderArr.push([orderObj.name, sortingOrder])
  }
  return orderArr
}

/**
 * Parse sequelize where criteria
 * @param {Object} whereObj  
 */
function _parseWhereOpt(whereObj) {
  if (!whereObj) return {}
  let whereOpt = {}
  Object.keys(whereObj).forEach(key => {
    if (key === 'duration' || key === 'distance') {
      whereOpt[key] = {
        [Op.and]: [
          whereObj[key].min ? { [Op.gte]: whereObj[key].min } : { [Op.gte]: 0 },
          whereObj[key].max ? { [Op.lte]: whereObj[key].max } : { [Op.lte]: Number.MAX_VALUE }
        ]
      }
    } else if (key === 'departureStationId' || key === 'returnStationId') {
      whereOpt[key] = whereObj[key].val
    }
  })
  return whereOpt
}

/**
  * List journey
  * @param {integer} pageIndex 
  * @param {integer} pageSize
  * @param {Object} order order criteria
  * @param {Object} where where criteria
*/
async function getJourneyList({ pageIndex = 0, pageSize = PAGE_SIZE, order, where }) {
  const whereOpt = _parseWhereOpt(where)
  const count = await Journey.count({
    where: whereOpt
  })
  const result = await Journey.findAll({
    limit: pageSize,
    offset: pageSize * pageIndex,
    order: _parseOrderOpt(order),
    where: whereOpt,
    attributes: ['id', 'departureStationId', 'returnStationId', 'duration', 'distance'],
    include: [
      {
        model: Station,
        attributes: ['name'],
        as: 'departureStation',
        required: true //inner join
      },
      {
        model: Station,
        attributes: ['name'],
        as: 'returnStation',
        required: true
      }
    ]
  })
  let journeyList = result.map(j => j.dataValues)
  journeyList = journeyList.map(j => {
    j.departureStation = j.departureStation.dataValues.name
    j.returnStation = j.returnStation.dataValues.name
    return j
  })

  return {
    count,
    pageSize,
    journeyList
  }
}

/**
 * Get min and max values of journey duration and distance columns
 */
async function getJourneyOverview() {
  const result = await Journey.findOne({
    attributes: [
      [Sequelize.fn('max', Sequelize.col('duration')), 'maxDuration'],
      [Sequelize.fn('min', Sequelize.col('duration')), 'minDuration'],
      [Sequelize.fn('max', Sequelize.col('distance')), 'maxDistance'],
      [Sequelize.fn('min', Sequelize.col('distance')), 'minDistance'],
    ],
  })
  return result.dataValues
}


module.exports = {
  dumpJourneyFromCsv,
  getJourneyList,
  getJourneyOverview
}

