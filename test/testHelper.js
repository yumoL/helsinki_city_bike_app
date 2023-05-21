const { Station, Journey } = require('../src/db/model/index')
const server = require('./server')

async function deleteAllStations() {
  await Station.destroy({ where: {} })
}

async function countStation() {
  return await Station.count()
}

async function deleteAllJourneys() {
  await Journey.destroy({ where: {} })
}

async function countJourney() {
  return await Journey.count()
}

async function uploadStations(filePath) {
  const res = await server
    .post('/api/station/upload')
    .attach('file', filePath)
  return res
}

async function uploadJourneys(filePath) {
  const res = await server
    .post('/api/journey/upload')
    .attach('file', filePath)
  return res
}

module.exports = {
  deleteAllStations,
  countStation,
  deleteAllJourneys,
  countJourney,
  uploadStations,
  uploadJourneys
}