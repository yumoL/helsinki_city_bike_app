const { dumpJourneyFromCsv,
  getJourneyList,
  getJourneyOverview }
  = require('../services/journey')
const { ErrorModel, SuccessModel } = require('../resModel/ResModel')
const fse = require('fs-extra')
const { uploadFileFailInfo, listJourneysFailInfo } = require('../resModel/ErrorInfo')

/**
 * Dump journey data to db
 * @param {string} filePath 
 */
async function dumpJourneyData(filePath) {
  try {
    await dumpJourneyFromCsv(filePath)
    await fse.remove(filePath)
    return new SuccessModel()
  } catch (e) {
    console.error(e.message, e.stack)
    return new ErrorModel(uploadFileFailInfo)
  }
}

/**
 * Get a journey list
 * @param {integer} pageIndex
 * @param {integer} pageSize
 * @param {Object} order order criteria 
 * @param {Object} where where criteria
 */
async function listJourneys({ pageIndex = 0, pageSize, order, where }) {
  try {
    let res = await getJourneyList({ pageIndex, pageSize, order, where })
    let journeyList = res.journeyList.map(j => {
      j.distance = (j.distance / 1000).toFixed(2)
      j.duration = (j.duration / 60).toFixed(2)
      return j
    })
    res.journeyList = journeyList
    return new SuccessModel(res)
  } catch (e) {
    console.error(e.message, e.stack)
    return new ErrorModel(listJourneysFailInfo)
  }
}

/**
 * Get min and max values of journey duration and distance columns
 */
async function getJourneyOverviewMinMax() {
  try {
    const res = await getJourneyOverview()
    let { minDuration, maxDuration, minDistance, maxDistance } = res
    res.minDuration = Math.floor(minDuration / 60)
    res.maxDuration = Math.ceil(maxDuration / 60)
    res.minDistance = Math.floor(minDistance / 1000)
    res.maxDistance = Math.ceil(maxDistance / 1000)
    return new SuccessModel(res)
  } catch (e) {
    console.error(e.message, e.stack)
    return new ErrorModel()
  }
}

module.exports = {
  dumpJourneyData,
  listJourneys,
  getJourneyOverviewMinMax
}