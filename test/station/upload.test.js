const { deleteAllStations, countStation, uploadStations } = require('../testHelper')
const path = require('path')
const server = require('../server')

describe('Page APIs', () => {
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

  test('Can list stations given a page number', async() => {
    const filePath = path.join(__dirname, '..', 'test_data', 'station', 'station_sample_normal.csv')
    await uploadStations(filePath)
    const res1 = await server.get('/api/station/all/1')
    expect(res1.body.errno).toBe(0)
    expect(res1.body.data.count).toBe(4)
    expect(res1.body.data.stationList.length).toBe(2)
  })
})