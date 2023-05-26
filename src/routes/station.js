const router = require('koa-router')()
const { dumpStationData, 
  listStations,
  getStation
} = require('../controllers/station')
const koaForm = require('../middlewares/koaForm')


router.prefix('/api/station')

router.post('/upload', koaForm(), async (ctx, next) => {
  const fileData = ctx.req.files['file']
  ctx.body = await dumpStationData(fileData.filepath)
})

router.get('/all/:pageIndex', async (ctx, next) => {
  let { pageIndex } = ctx.params
  const { keyword } = ctx.query
  if (pageIndex !== 'all') {
    pageIndex = parseInt(pageIndex)
  } else {
    pageIndex = null
  }
  ctx.body = await listStations({ keyword, pageIndex })
})

router.get('/single/:sid', async (ctx, next) => {
  let { sid } = ctx.params
  sid = parseInt(sid)
  let { month } = ctx.query
  let monthIndex = -1
  if (month) {
    monthIndex = parseInt(month) - 1
  }
  ctx.body = await getStation(sid, monthIndex)
})


module.exports = router
