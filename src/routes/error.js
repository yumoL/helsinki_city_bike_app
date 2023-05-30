const router = require('koa-router')()

router.get('/error', async(ctx, next) => {
  ctx.status = 500
})

module.exports = router