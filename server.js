const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { check } = require('express-validator')
const api = require('./api')
const isAuth = require('./middleware/isAuthenticated')
const { initDB } = require('./init-db')

const app = express()
const port = parseInt(process.env.PORT, 10) || 8084
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(express.json({ limit: '0.5mb' }))
app.use(express.urlencoded({ limit: '0.5mb', extended: true }))
app.use(cors())
app.use(helmet())
app.use(limiter)

app.post('/api/auth/login',
  check('username').not().isEmpty().trim().escape(),
  check('password').not().isEmpty().trim().escape(),
  api.signIn,
)
app.get('/api/auth/user', (req, res) => {
  res.sendStatus(200)
})

app.get('/stats', api.getStats)

app.get('/kilometers', isAuth, api.getKilometers)
app.get('/kilometers/:id', isAuth, api.getKilometers)
app.post('/kilometers',
  check('name').trim().escape(),
  check('kilometers').isNumeric().trim().escape(),
  check('image').isBase64().trim().escape(),
  api.addKilometers,
)
app.delete('/kilometers/:id', isAuth, api.deleteKilometers)

app.get('/donations', isAuth, api.getDonations)
app.get('/donations/:id', isAuth, api.getDonations)
app.post('/donations',
  check('name').trim().escape(),
  check('amount').isNumeric().trim().escape(),
  check('image').isBase64().trim().escape(),
  api.addDonation,
)
app.delete('/donations/:id', isAuth, api.deleteDonation)

app.get('/top10', api.getTop10)

try {
  app.listen(port, async () => {
    await initDB()
    console.log(`Connected successfully on port ${ port }`)
  })
} catch (error) {
  console.error(`Error occurred: ${ error.message }`)
}
