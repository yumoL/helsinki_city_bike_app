const router = require('koa-router')()
const { dumpJourneyData, listJourneys, getJourneyOverviewMinMax } = require('../controllers/journey')
const koaForm = require('../middlewares/koaForm')


router.prefix('/api/journey')

router.post('/upload', koaForm(), async (ctx, next) => {
  const fileData = ctx.req.files['file']
  const res = await dumpJourneyData(fileData.filepath)
  if (res.errno) {
    ctx.status = 500
  }
  ctx.body = res
})

router.post('/all/:pageIndex', async (ctx, next) => {
  let { pageIndex } = ctx.params
  let { order, where } = ctx.request.body
  const res = await listJourneys({ pageIndex, order, where })
  if (res.errno) {
    ctx.status = 404
  }
  ctx.body = res
})

router.get('/overview', async (ctx, next) => {
  const res = await getJourneyOverviewMinMax()
  if (res.errno) {
    ctx.status = 500
  }
  ctx.body = res
})


module.exports = router
