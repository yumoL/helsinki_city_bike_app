const { deleteAllStations, countStation, uploadStations } = require('../testHelper')
const path = require('path')
const server = require('../server')

beforeEach(async () => {
  await deleteAllStations()
})

describe('Dumping stations to DB', () => {
  test('Can filter out invalid station data', async () => {
    const filePath = path.join(__dirname, '..', 'test_data', 'station', 'station_sample_invalid.csv')
    const res = await uploadStations(filePath)

    expect(res.body.errno).toBe(0)
    const stationCount = await countStation()
    expect(stationCount).toBe(3)
  })

})

describe('Listing stations', () => {
  beforeEach(async () => {
    const filePath = path.join(__dirname, '..', 'test_data', 'station', 'station_sample_normal.csv')
    await uploadStations(filePath)
  })

  test('Can list stations given a page number', async () => {
    const res = await server
      .get('/api/station/all/0')
      .query({ keyword: '' })
    expect(res.body.errno).toBe(0)
    expect(res.body.data.count).toBe(4)
    expect(res.body.data.stationList.length).toBe(2)
  })

  test('Can list stations based on station name keyword', async () => {
    const res = await server
      .get('/api/station/all/0')
      .query({ keyword: 'hana' })
    expect(res.body.errno).toBe(0)
    expect(res.body.data.count).toBe(1)
    expect(res.body.data.stationList.length).toBe(1)

    const res2 = await server
      .get('/api/station/all/0')
      .query({ keyword: 'na' })
    expect(res2.body.errno).toBe(0)
    expect(res2.body.data.count).toBe(2)
    expect(res2.body.data.stationList.length).toBe(2)

    const res3 = await server
      .get('/api/station/all/1')
      .query({ keyword: 'a' })
    expect(res3.body.errno).toBe(0)
    expect(res3.body.data.count).toBe(4)
    expect(res3.body.data.stationList.length).toBe(2)
  })
})