const mongose = require('mongoose')

const URLSchema = new mongose.Schema({

  url: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }

})

const URL_MODEL = mongose.model('urls', URLSchema)

module.exports = URL_MODEL