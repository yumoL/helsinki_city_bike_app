const { dumpJourneyFromCsv } = require('../services/journey')
const { ErrorModel, SuccessModel } = require('../resModel/ResModel')
const fse = require('fs-extra')
const { uploadFileFailInfo } = require('../resModel/ErrorInfo')

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

module.exports = {
  dumpJourneyData
}