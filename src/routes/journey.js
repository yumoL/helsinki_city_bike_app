const router = require('koa-router')()
const { dumpJourneyData } = require('../controllers/journey')
const koaForm = require('../middlewares/koaForm')


router.prefix('/api/journey')

router.post('/upload', koaForm(), async(ctx, next) => {
  const fileData = ctx.req.files['file']
  ctx.body = await dumpJourneyData(fileData.filepath)
})


module.exports = router
