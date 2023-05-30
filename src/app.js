const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('@koa/cors')

const stationRouter = require('./routes/station')
const journeyRouter = require('./routes/journey')
const errorRouter = require('./routes/error')

const { MAX_FILE_SIZE } = require('./config/constant')

// error handler
const onErrorConf = {
  redirect: '/error'
}
onerror(app, onErrorConf)

// middlewares
app.use(cors())
app.use(bodyparser({
  enableTypes:['json', 'form', 'text'],
  formLimit: `${MAX_FILE_SIZE}mb`
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(stationRouter.routes(), stationRouter.allowedMethods())
app.use(journeyRouter.routes(), journeyRouter.allowedMethods())
app.use(errorRouter.routes(), errorRouter.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
