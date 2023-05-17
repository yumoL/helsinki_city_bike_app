const router = require('koa-router')()
const { dumpStationData } = require('../controllers/station')
const koaForm = require('../middlewares/koaForm')


router.prefix('/api/station')

router.post('/upload', koaForm(), async(ctx, next) => {
  const fileData = ctx.req.files['file']
  ctx.body = await dumpStationData(fileData.filepath)
})


module.exports = router
