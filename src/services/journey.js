const { Journey, Station } = require('../db/model/index')
const { getStationIds } = require('./station')
const { dumpDataFromCsv } = require('./utils')

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
  * List journey
  * @param {Integer} pageIndex 
  * @param {Integer} pageSize
*/
// async function listJourney({ pageIndex = 0, pageSize = 6 }) {
//   const result = await Journey.findAndCountAll({
//     limit: pageSize,
//     offset: pageSize * pageIndex,
//     order: [
//       ['id', 'ASC']
//     ],
//     include: [
//       {
//         model: Station,
//         attributes: ['name'],
//         as: 'departureStation'
//       },
//       {
//         model: Station,
//         attributes: ['name'],
//         as: 'returnStation'
//       }
//     ]
//   })
//   let journeyList = result.rows.map(j => j.dataValues)
//   journeyList = journeyList.map(j => {
//     j.departureStation = j.departureStation.dataValues.name
//     j.returnStation = j.returnStation.dataValues.name
//     return j
//   })
//   //console.log(journeyList)
//   return {
//     count: result.count,
//     journeyList
//   }
// }


module.exports = {
  dumpJourneyFromCsv
}

