const { DataTypes } = require('sequelize')
const seq = require('../seq')

const Journey = seq.define('journey', {
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  departureStationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  returnStationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 10
    },
    comment: 'unit: m'
  },
  duration: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 10
    },
    comment: 'unit: second'
  },
},
{
  indexes: [
    {
      unique: false,
      fields: ['departureStationId']
    },
    {
      unique: false,
      fields: ['returnStationId']
    },
  ]
}
)

module.exports = Journey