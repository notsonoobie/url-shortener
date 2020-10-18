const path = require('path')
const express = require('express')
const helmet = require('helmet') // Express App Security - Headers
const cors = require('cors')
const morgan = require('morgan') // Logging Request
const yup = require('yup') // Schema Validations
const { nanoid } = require('nanoid')

if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const db = require('./db/db')() // DB CONNECTION

const URL_MODEL = require('./schema/URLSchema')
const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json()) // Body Parser Middleware

app.use(cors())

app.use(helmet())
app.use(morgan('common')) // Logging API Calls

const schema = yup.string().trim().url().required()

// All API Routes

app.get('/:id', async (req,res, next) => {

  // GET THE ID, AND REDIRECT TO THE URL
  const slug = req.params.id
  try{

    let urlInMongo = await URL_MODEL.findOne({
      slug
    })

    if(!urlInMongo){
      return res.redirect(`${req.protocol}://${req.headers.host}`)
    }

    res.status(301).redirect(urlInMongo.url)

  }catch(e){
    next(e)
  }
})

app.post('/url', async (req,res, next) => {

  // GET THE URL, CREATE ID FOR THAT URL, RESPOND WITH SHORT URL

  const { url } = req.body
  try{

    await schema.validate(url)

    const slug = nanoid(7).toLowerCase()

    let urlInMongo = await URL_MODEL.findOne({
      url
    })

    if(urlInMongo){
      return res.status(302).json({
        _id: urlInMongo.id,
        url: urlInMongo.url,
        slug: urlInMongo.slug,
        fullUrl: `${req.protocol}://${req.headers.host}/${urlInMongo.slug}`,
        createdAt: urlInMongo.date
      })
    }

    url_to_model = new URL_MODEL({
      url,
      slug
    })

    await url_to_model.save((err,doc) => {
      if(err) next(err)
      return res.status(201).json({
        _id: doc.id,
        url: doc.url,
        slug: doc.slug,
        fullUrl: `${req.protocol}://${req.headers.host}/${doc.slug}`,
        createdAt: doc.date
      })
    })

  }catch(e){
    next(e)
  }

})

if(process.env.NODE_ENV === 'production'){
  app.use(express.static('client/build'))
  app.get('*', (req,res) => {
      res.sendFile(path.resolve(__dirname,'client','build','index.html'))
  })
}

app.use((error, req, res, next) => {
  res.status(422).json({
    message: error.message,
    issue: error
  })
})

app.listen(PORT, () => {
  console.log(`Server up and running at Port ${PORT}`)
})