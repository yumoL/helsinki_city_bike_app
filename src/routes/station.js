const router = require('koa-router')()
const { dumpStationData, listStations } = require('../controllers/station')
const koaForm = require('../middlewares/koaForm')


router.prefix('/api/station')

router.post('/upload', koaForm(), async (ctx, next) => {
  const fileData = ctx.req.files['file']
  ctx.body = await dumpStationData(fileData.filepath)
})

router.get('/all/:pageIndex', async (ctx, next) => {
  let { pageIndex } = ctx.params
  const { keyword } = ctx.query
  pageIndex = parseInt(pageIndex)
  ctx.body = await listStations({ keyword, pageIndex })
})


module.exports = router
