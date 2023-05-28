const seq = require('./seq')
require('./model/index')

seq.authenticate().then(() => {
  console.log('auth ok')
}).catch(() => {
  console.error('auth err')
})

seq.sync({ force: true }).then(() => {
  console.log('sync ok')
  process.exit()
})