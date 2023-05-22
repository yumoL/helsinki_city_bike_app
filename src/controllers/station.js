const { dumpStationFromCsv, getStationList } = require('../services/station')
const { ErrorModel, SuccessModel } = require('../resModel/ResModel')
const fse = require('fs-extra')
const { uploadFileFailInfo,
  listStationsFailInfo
} = require('../resModel/ErrorInfo')

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

async function listStations({ pageIndex, pageSize }) {
  try {
    const data = await getStationList({ pageIndex, pageSize })
    return new SuccessModel(data)
  } catch (e) {
    console.error(e)
    return new ErrorModel(listStationsFailInfo)
  }
}

module.exports = {
  dumpStationData,
  listStations
}