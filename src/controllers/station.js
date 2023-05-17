const { dumpStationFromCsv } = require('../services/station')
const { ErrorModel, SuccessModel } = require('../resModel/ResModel')
const fse = require('fs-extra')
const { uploadFileFailInfo } = require('../resModel/ErrorInfo')

/**
 * 
 * @param {string} filePath 
 */
async function dumpStationData(filePath) {
  try {
    await dumpStationFromCsv(filePath)
  } catch (e) {
    return new ErrorModel(uploadFileFailInfo)
  }
  // remove the file after dumping it to db
  await fse.remove(filePath)
  return new SuccessModel()
}

module.exports = {
  dumpStationData
}