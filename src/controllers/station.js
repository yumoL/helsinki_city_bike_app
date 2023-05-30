const { dumpStationFromCsv,
  getStationList,
  getStationBySid
}
  = require('../services/station')
const { ErrorModel, SuccessModel } = require('../resModel/ResModel')
const fse = require('fs-extra')
const { uploadFileFailInfo,
  listStationsFailInfo,
  getSingleStationFailInfo,
  parseIntegerFailInfo
} = require('../resModel/ErrorInfo')

/**
 * 
 * @param {string} filePath 
 */
async function dumpStationData(filePath) {
  try {
    await dumpStationFromCsv(filePath)
  } catch (e) {
    console.error(e.message, e.stack)
    return new ErrorModel(uploadFileFailInfo)
  }
  // remove the file after dumping it to db
  await fse.remove(filePath)
  return new SuccessModel()
}

/**
 * Get a station list
 * @param {string} keyword keyword used in like search by name
 * @param {string} pageIndex 
 * @param {number} pageSize 
 */
async function listStations({ keyword, pageIndex }) {
  if (pageIndex === 'all') {
    pageIndex = null
  } else {
    try {
      pageIndex = parseInt(pageIndex)
    } catch (e) {
      console.error(e.message, e.stack)
      return new ErrorModel(parseIntegerFailInfo)
    }
  }
  try {
    const data = await getStationList({ keyword, pageIndex })
    return new SuccessModel(data)
  } catch (e) {
    console.error(e.message, e.stack)
    return new ErrorModel(listStationsFailInfo)
  }
}

/**
 * Given an array of objects, calculate the sum of occurrences for each unique value of the specified key
 * @param {Array} arr an array of objects
 * @param {string} key 
 */
function _sumBy(arr, key) {
  return arr.reduce((dict, obj) => {
    let count = dict[obj[key]['name']] ? dict[obj[key]['name']] : 0
    dict[obj[key]['name']] = count + 1
    return dict
  }, {})
}

/**
 * Sort object properties by value in reversed order
 * @param {Object} obj 
 * 
 */
function _sortObjByVal(obj) {
  const sorted = Object.entries(obj).sort(([, a], [, b]) => b - a)
  let arr = []
  for (entry of sorted) {
    arr.push({
      name: entry[0],
      count: entry[1]
    })
  }
  return arr
}

/**
 * Get a station by sid
 * @param {string} sid 
 * @param {string|undefined} month
 */
async function getStation(sid, month) {
  let monthIndex
  try {
    sid = parseInt(sid)
    monthIndex = parseInt(month) - 1
  } catch (e) {
    console.error(e.message, e.stack)
    return new ErrorModel(parseIntegerFailInfo)
  }
  if (!monthIndex) {
    monthIndex = -1
  }

  let station
  try {
    station = await getStationBySid(sid, monthIndex)
  } catch (e) {
    console.error(e.message, e.stack)
    return new ErrorModel(getSingleStationFailInfo)
  }

  //Total number of journeys starting from the station
  const departureCount = station.departures.length

  //Total number of journeys ending at the station
  const returnCount = station.returns.length

  //The average distance of a journey starting from the station
  let departureAvgDist = station.departures.reduce(
    (accumulator, curr) => accumulator + curr.distance,
    0) / departureCount
  departureAvgDist = (departureAvgDist / 1000).toFixed(2) //convert to km

  //The average distance of a journey ending at the station
  let returnAvgDist = station.returns.reduce(
    (accumulator, curr) => accumulator + curr.distance,
    0) / returnCount
  returnAvgDist = (returnAvgDist / 1000).toFixed(2)

  //Top 5 most popular return stations for journeys starting from the station
  const popularReturnStations = _sortObjByVal(
    _sumBy(station.departures, 'returnStation')
  ).slice(0, 5)

  //Top 5 most popular departure stations for journeys ending at the station
  const popularDepartureStations = _sortObjByVal(
    _sumBy(station.returns, 'departureStation')
  ).slice(0, 5)

  delete station.departures
  delete station.returns
  station = {
    ...station,
    departureCount,
    returnCount,
    departureAvgDist,
    returnAvgDist,
    popularReturnStations,
    popularDepartureStations
  }

  return new SuccessModel(station)
}

module.exports = {
  dumpStationData,
  listStations,
  getStation
}