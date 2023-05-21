const server = require('../server')
const { deleteAllStations,
  countJourney,
  deleteAllJourneys,
  uploadStations,
  uploadJourneys } = require('../testHelper')
const path = require('path')

describe('Upload a journey CSV file', () => {
  beforeEach(async () => {
    await deleteAllStations()
    await deleteAllJourneys()
    await uploadStations(
      path.join(__dirname, '..', 'test_data', 'station', 'station_sample_normal.csv')
    )
  })

  test('Can filter out invalid journey data', async () => {
    const filePath = path.join(__dirname, '..', 'test_data', 'journey', 'journey_sample_invalid.csv')
    const res = await uploadJourneys(filePath)
    expect(res.body.errno).toBe(0)
    const journeyCount = await countJourney()
    expect(journeyCount).toBe(3)
  })

})