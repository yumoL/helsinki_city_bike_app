const router = require('koa-router')()
const { dumpStationData, 
  listStations,
  getStation
} = require('../controllers/station')
const koaForm = require('../middlewares/koaForm')


router.prefix('/api/station')

router.post('/upload', koaForm(), async (ctx, next) => {
  const fileData = ctx.req.files['file']
  const res = await dumpStationData(fileData.filepath)
  if (res.errno) {
    ctx.status = 500
  }
  ctx.body = res
})

router.get('/all/:pageIndex', async (ctx, next) => {
  let { pageIndex } = ctx.params
  const { keyword } = ctx.query
  const res = await listStations({ keyword, pageIndex })
  if (res.errno) {
    ctx.status = 404
  }
  ctx.body = res
})

router.get('/single/:sid', async (ctx, next) => {
  let { sid } = ctx.params
  let { month } = ctx.query
  const res = await getStation(sid, month)
  if (res.errno) {
    ctx.status = 404
  }
  ctx.body = res
})


module.exports = router
