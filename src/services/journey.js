const { Journey, Station } = require('../db/model/index')
const { getStationIds } = require('./station')
const { dumpDataFromCsv } = require('./utils')

/**
 * Create a journey
 * @param {Object} journey journey attributes {departureTime, returnTime, departureStation, returnStation, distance, duration}
 * @returns 
 */
// async function createJourney({ departureTime, returnTime, departureStation, returnStation, distance, duration }) {
//   //!departureTime || !returnTime || !departureStation || !returnStation || !distance || !duration ||
//   if (distance < 10 || duration < 10) return
//   const result = await Journey.create({
//     departureTime,
//     returnTime,
//     departureStation,
//     returnStation,
//     distance,
//     duration
//   })
//   return result.dataValues
// }

// async function createBulkJourney(journeyList) {
//   Journey.bulkCreate(journeyList)
// }

/**
 * Map a journey chunk that contains raw journey data to a structured journey list where data properties are according to the Journey model
 * @param {Array} journeyChunk
 */
async function _mapJourneyList(journeyChunk) {
  const stationIds = await getStationIds()
  return journeyChunk
    .map(journeyItem => {
      return {
        departureTime: journeyItem['Departure'],
        returnTime: journeyItem['Return'],
        departureStationId: parseInt(journeyItem['Departure station id']),
        returnStationId: parseInt(journeyItem['Return station id']),
        distance: parseInt(journeyItem['Covered distance (m)']),
        duration: parseInt(journeyItem['Duration (sec.)'])
      }
    })
    .filter(journey =>
      stationIds.has(journey.departureStationId) &&
      stationIds.has(journey.returnStationId) &&
      journey.distance >= 10 &&
      journey.duration >= 10)
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
function dumpJourneyFromCsv(fileName) {
  return dumpDataFromCsv(fileName, _mapJourneyList, _bulkCreateJourneys)
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

