const Station = require('./Station')
const Journey = require('./Journey')

//sequelize accosiation https://sequelize.org/docs/v6/core-concepts/assocs/#notes
Station.hasMany(Journey, { as: 'departures', foreignKey: 'departureStationId', sourceKey: 'sid'})
Station.hasMany(Journey, { as: 'returns', foreignKey: 'returnStationId', sourceKey: 'sid' })
Journey.belongsTo(Station, { as: 'departureStation', foreignKey: 'departureStationId', targetKey: 'sid' })
Journey.belongsTo(Station, { as: 'returnStation', foreignKey: 'returnStationId', targetKey: 'sid' })


module.exports = {
  Station,
  Journey
}