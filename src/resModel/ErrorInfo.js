/**
 * @description error information, includes errorno and message
 */

module.exports = {
  uploadFileFailInfo: {
    errno: 10001,
    message: 'Failed to upload the file'
  },
  listStationsFailInfo: {
    errno: 10002,
    message: 'Failed to fetch station list'
  },
  getSingleStationFailInfo: {
    errno: 10003, 
    message: 'Failed to fetch the station'
  },
  listJourneysFailInfo: {
    errno: 10004,
    message: 'Failed to list journeys'
  }
}