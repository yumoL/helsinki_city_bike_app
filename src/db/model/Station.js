const { DataTypes } = require('sequelize')
const seq = require('../seq')

const Station = seq.define('station', {
  sid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  operator: {
    type: DataTypes.STRING,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  x: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  y: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
},
{
  indexes: [
    {
      unique: false,
      fields: ['name']
    }
  ]
}
)

module.exports = Station