const server = require('../server')
const { deleteAllStations,
  countJourney,
  deleteAllJourneys,
  uploadStations,
  uploadJourneys } = require('../testHelper')
const path = require('path')

beforeEach(async () => {
  await deleteAllStations()
  await deleteAllJourneys()
  await uploadStations(
    path.join(__dirname, '..', 'test_data', 'station', 'station_sample_normal.csv')
  )
})

describe('Upload a journey CSV file', () => {

  test('Can filter out invalid journey data', async () => {
    const filePath = path.join(__dirname, '..', 'test_data', 'journey', 'journey_sample_invalid.csv')
    const res = await uploadJourneys(filePath)
    expect(res.body.errno).toBe(0)
    const journeyCount = await countJourney()
    expect(journeyCount).toBe(3)
  })

})

describe('List journeys', () => {
  beforeEach(async () => {
    await uploadJourneys(
      path.join(__dirname, '..', 'test_data', 'journey', 'journey_sample_normal2.csv')
    )
  })

  const defaultList = [
    {
      departureStationId: 501,
      returnStationId: 503,
      duration: '8.33',
      distance: '2.04',
      departureStation: 'Hanasaari',
      returnStation: 'Keilalahti'
    },
    {
      departureStationId: 503,
      returnStationId: 505,
      duration: '10.18',
      distance: '1.87',
      departureStation: 'Keilalahti',
      returnStation: 'Westendinasema'
    },
    {
      departureStationId: 505,
      returnStationId: 22,
      duration: '6.65',
      distance: '0.10',
      departureStation: 'Westendinasema',
      returnStation: 'Central Railway Station/West'
    },
    {
      departureStationId: 503,
      returnStationId: 501,
      duration: '101.83',
      distance: '18.70',
      departureStation: 'Keilalahti',
      returnStation: 'Hanasaari'
    },
    {
      departureStationId: 501,
      returnStationId: 511,
      duration: '5.00',
      distance: '2.03',
      departureStation: 'Hanasaari',
      returnStation: 'Sateentie'
    },
  ]

  test('Can list journeys when no order or filter criterion is given', async () => {
    const res = await server
      .post('/api/journey/all/0')
    expect(res.body.errno).toBe(0)
    const resData = res.body.data
    expect(resData.count).toBe(5)
    const correctList = defaultList.slice(0, 3)
    const journeyList = resData.journeyList.map(j => {
      delete j['id']
      return j
    })
    for (let i = 0; i < journeyList.length; i++) {
      expect(journeyList[i]).toEqual(correctList[i])
    }
  })

  test('Can list journeys sorted by departure station name in ASC order', async () => {
    const res = await server
      .post('/api/journey/all/0')
      .send({
        'order': {
          name: 'departureStation',
          order: 1
        }
      })
    const resData = res.body.data
    const correctList = defaultList.sort((a, b) => a.departureStation.localeCompare(b.departureStation))
    const journeyList = resData.journeyList.map(j => {
      delete j['id']
      return j
    })
    for (let i = 0; i < journeyList.length; i++) {
      expect(journeyList[i]).toEqual(correctList[i])
    }
  })

  test('Can list journeys sorted by arrival station name in DESC order', async () => {
    const res = await server
      .post('/api/journey/all/0')
      .send({
        'order': {
          name: 'returnStation',
          order: 0
        }
      })
    const resData = res.body.data
    const correctList = defaultList.sort((a, b) => b.returnStation.localeCompare(a.returnStation))
    const journeyList = resData.journeyList.map(j => {
      delete j['id']
      return j
    })
    for (let i = 0; i < journeyList.length; i++) {
      expect(journeyList[i]).toEqual(correctList[i])
    }
  })

  test('Can list journeys sorted by duration in ASC order', async () => {
    const res = await server
      .post('/api/journey/all/0')
      .send({
        'order': {
          name: 'duration',
          order: 1
        }
      })
    const resData = res.body.data
    const correctList = defaultList.sort((a, b) => a.duration - b.duration)
    const journeyList = resData.journeyList.map(j => {
      delete j['id']
      return j
    })
    for (let i = 0; i < journeyList.length; i++) {
      expect(journeyList[i]).toEqual(correctList[i])
    }
  })

  test('Can list journeys sorted by distance in DESC order (second page)', async () => {
    const res = await server
      .post('/api/journey/all/1')
      .send({
        'order': {
          name: 'distance',
          order: 0
        }
      })
    const resData = res.body.data
    const correctList = defaultList.sort((a, b) => b.distance - a.distance).slice(3, 5)
    const journeyList = resData.journeyList.map(j => {
      delete j['id']
      return j
    })
    for (let i = 0; i < journeyList.length; i++) {
      expect(journeyList[i]).toEqual(correctList[i])
    }
  })

  test('Can filter journeys when where criteria are given', async () => {
    const res = await server
      .post('/api/journey/all/0')
      .send({
        where: {
          "duration": {
            max: 600,
            min: 300
          },
          "distance": {
            min: 2000
          }
        }
      })
    const resData = res.body.data
    const correctList = defaultList.filter(j => j.duration * 60 >= 300 && j.duration * 60 <= 600 && j.distance * 1000 >= 2000)
    const journeyList = resData.journeyList.map(j => {
      delete j['id']
      return j
    })
    for (let i = 0; i < journeyList.length; i++) {
      expect(journeyList[i]).toEqual(correctList[i])
    }
  })

  test('Can order and filter journeys when both order and where criteria are given', async () => {
    const res = await server
      .post('/api/journey/all/0')
      .send({
        order: {
          "name": "distance",
          "order": 0
        },
        where: {
          "departureStationId": {
            val: 501
          }
        }
      })
      const resData = res.body.data
      const correctList = defaultList.filter(j => j.departureStationId === 501).sort((a, b) => b.distance > a.distance)
      const journeyList = resData.journeyList.map(j => {
        delete j['id']
        return j
      })
      for (let i = 0; i < journeyList.length; i++) {
        expect(journeyList[i]).toEqual(correctList[i])
      }
  })
})
