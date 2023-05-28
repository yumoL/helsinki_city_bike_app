const router = require('koa-router')()
const { dumpJourneyData, listJourneys, getJourneyOverviewMinMax } = require('../controllers/journey')
const koaForm = require('../middlewares/koaForm')


router.prefix('/api/journey')

router.post('/upload', koaForm(), async (ctx, next) => {
  const fileData = ctx.req.files['file']
  ctx.body = await dumpJourneyData(fileData.filepath)
})

router.post('/all/:pageIndex', async (ctx, next) => {
  let { pageIndex } = ctx.params
  let { order, where } = ctx.request.body
  pageIndex = parseInt(pageIndex)
  ctx.body = await listJourneys({ pageIndex, order, where })
})

router.get('/overview', async(ctx, next) => {
  ctx.body = await getJourneyOverviewMinMax()
})


module.exports = router
