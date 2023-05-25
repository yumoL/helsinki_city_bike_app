const { deleteAllStations, countStation, uploadStations, uploadJourneys } = require('../testHelper')
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
    expect(res.body.data.count).toBe(7)
    expect(res.body.data.stationList.length).toBe(3)
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
    expect(res3.body.data.count).toBe(5)
    expect(res3.body.data.stationList.length).toBe(2)
  })
})

describe('Fetch a single station', () => {
  beforeEach(async () => {
    const stationFilePath = path.join(__dirname, '..', 'test_data', 'station', 'station_sample_normal.csv')
    const journeyFilePath = path.join(__dirname, '..', 'test_data', 'journey', 'journey_sample_normal.csv')
    await uploadStations(stationFilePath)
    await uploadJourneys(journeyFilePath)
  })

  test('Can fetch a single station with its departure and return journeys across all month', async () => {
    const res = await server
      .get('/api/station/501')
    expect(res.body.errno).toBe(0)
    const resData = res.body.data
    const correctData = {
      sid: 501,
      name: 'Hanasaari',
      address: 'Hanasaarenranta 1',
      capacity: 10,
      x: 24.8403,
      y: 60.1658,
      departureCount: 22,
      returnCount: 22,
      departureAvgDist: '2.25',
      returnAvgDist: '0.66',
      popularReturnStations: [
        { name: 'Keilalahti', count: 7 },
        { name: 'Central Railway Station/West', count: 5 },
        { name: 'Westendinasema', count: 4 },
        { name: 'Sateentie', count: 3 },
        { name: 'Golfpolku', count: 2 }
      ],
      popularDepartureStations: [
        { name: 'Keilalahti', count: 7 },
        { name: 'Westendinasema', count: 5 },
        { name: 'Central Railway Station/West', count: 4 },
        { name: 'Golfpolku', count: 3 },
        { name: 'Revontulentie', count: 2 }
      ]
    }
    expect(resData).toEqual(correctData)
  })

  test('Can fetch a single station with its departure and return journeys when month is specified', async () => {
    const res = await server
      .get('/api/station/501')
      .query({ month: 5 })
    expect(res.body.errno).toBe(0)
    const resData = res.body.data
    const correctData = {
      sid: 501,
      name: 'Hanasaari',
      address: 'Hanasaarenranta 1',
      capacity: 10,
      x: 24.8403,
      y: 60.1658,
      departureCount: 21,
      returnCount: 21,
      departureAvgDist: '2.26',
      returnAvgDist: '0.61',
      popularReturnStations: [
        { name: 'Keilalahti', count: 6 },
        { name: 'Central Railway Station/West', count: 5 },
        { name: 'Westendinasema', count: 4 },
        { name: 'Sateentie', count: 3 },
        { name: 'Golfpolku', count: 2 }
      ],
      popularDepartureStations: [
        { name: 'Keilalahti', count: 6 },
        { name: 'Westendinasema', count: 5 },
        { name: 'Central Railway Station/West', count: 4 },
        { name: 'Golfpolku', count: 3 },
        { name: 'Revontulentie', count: 2 }
      ]
    }
    expect(resData).toEqual(correctData)
  })
})