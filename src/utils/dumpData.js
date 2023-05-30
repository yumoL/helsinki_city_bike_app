
const path = require('path')
const { dumpStationFromCsv } = require('../services/station')
const { dumpJourneyFromCsv } = require('../services/journey')

!(async function () {
  const stationDataPath = path.join(__dirname, '..', '..', 'app_data', 'station_data', 'helsinki_espoo_station.csv')
  
  await dumpStationFromCsv(stationDataPath)
  for (filename of ['2021-05.csv', '2021-06.csv']) {
    const journeyDataPath = path.join(__dirname, '..', '..', 'app_data', 'journey_data', filename)
    await dumpJourneyFromCsv(journeyDataPath)
  }
  
})()


