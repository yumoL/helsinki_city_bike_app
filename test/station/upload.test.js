const { deleteAllStations, countStation, uploadStations } = require('../testHelper')
const path = require('path')

describe('Upload a station CSV file', () => {
  beforeEach(async () => {
    await deleteAllStations()
  })

  test('Can filter out invalid station data', async () => {
    const filePath = path.join(__dirname, '..', 'test_data', 'station', 'station_sample_invalid.csv')
    const res = await uploadStations(filePath)

    expect(res.body.errno).toBe(0)
    const stationCount = await countStation()
    expect(stationCount).toBe(3)
  })

})