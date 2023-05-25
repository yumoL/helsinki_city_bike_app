const { dumpJourneyFromCsv, getJourneyList } = require('../services/journey')
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
    console.error(e)
    return new ErrorModel(listJourneysFailInfo)
  }
}

module.exports = {
  dumpJourneyData,
  listJourneys
}