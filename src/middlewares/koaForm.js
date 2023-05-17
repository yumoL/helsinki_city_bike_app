const formidable = require('formidable')
const path = require('path')
const fse = require('fs-extra')
const { MAX_FILE_SIZE } = require('../config/constant')

const UPLOADED_DIR = path.join(__dirname, '..', 'uploadedFiles')

// Create the uploaded dir if not existing
fse.pathExists(UPLOADED_DIR).then(exist => {
  if (!exist) {
      fse.ensureDir(UPLOADED_DIR)
  }
})

module.exports = function () {
  return async function (ctx, next) {
    const form = formidable({ 
      multiples: false,
      maxFileSize: MAX_FILE_SIZE * 1024 * 1024,
      uploadDir: UPLOADED_DIR,
      keepExtensions: true
    })

    await new Promise((resolve, reject) => {  
      form.parse(ctx.req, (err, fields, files) => {
        if (err) {
          return reject(err)
        }
        ctx.req.fields = fields
        ctx.req.files = files       
        resolve()
      })
    })
    await next()
  }
}
