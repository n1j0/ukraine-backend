const db = require('./config/database')
const config = require('./config/auth')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const addHeadersToResponse = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

const signIn = async (req, res) => {
  addHeadersToResponse(res)

  try {
    const { username, password } = req.body
    const client = await db.connect()
    const user = (await client.query('SELECT * from "users" WHERE username = $1', [ username ])).rows[0]
    await client.release()
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }
    const isPassValid = await bcrypt.compare(password, user.password)
    if (!isPassValid) {
      return res.status(401).json({ accessToken: null, message: 'Invalid password!' })
    }
    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    })
    res.status(200).json({
      token,
    })
  } catch (err) {
    console.log(err)
  }
}

const addKilometers = async (req, res) => {
  addHeadersToResponse(res)

  try {
    const client = await db.connect()
    await client.query('INSERT INTO kilometers (name, kilometers, image) VALUES ($1, $2, $3)', [ req.body.name, req.body.kilometers, req.body.image ])
    await client.release()
    return res.sendStatus(201)
  } catch (error) {
    return res.status(500).json(error)
  }
}

const addDonation = async (req, res) => {
  addHeadersToResponse(res)

  try {
    const client = await db.connect()
    await client.query('INSERT INTO donations (name, amount, image) VALUES ($1, $2, $3)', [ req.body.name, req.body.amount, req.body.image ])
    await client.release()
    return res.sendStatus(201)
  } catch (error) {
    return res.status(500).json(error)
  }
}

const getKilometers = async (req, res) => {
  addHeadersToResponse(res)

  try {
    const client = await db.connect()
    let queryResult
    if (!req.params.id) {
      queryResult = (await client.query('SELECT "id", "name", "kilometers" from kilometers')).rows
    } else {
      queryResult = (await client.query('SELECT * from kilometers WHERE id = $1', [ req.params.id ])).rows[0]
    }
    client.release()
    return res.status(200).json(queryResult)
  } catch (error) {
    return res.status(500).json('Error on getKilometers' + error)
  }
}

const deleteKilometers = async (req, res) => {
  addHeadersToResponse(res)

  try {
    const client = await db.connect()
    if (!req.params.id) {
      return res.sendStatus(501)
    } else {
      await client.query('DELETE from kilometers WHERE id = $1', [ req.params.id ])
    }
    client.release()
    return res.sendStatus(204)
  } catch (error) {
    return res.status(500).json('Error on deleteKilometers' + error)
  }
}

const getDonations = async (req, res) => {
  addHeadersToResponse(res)

  try {
    const client = await db.connect()
    let queryResult
    if (!req.params.id) {
      queryResult = (await client.query('SELECT "id", "name", "amount" from donations')).rows
    } else {
      queryResult = (await client.query('SELECT * from donations WHERE id = $1', [ req.params.id ])).rows[0]
    }
    client.release()
    return res.status(200).json(queryResult)
  } catch (error) {
    return res.status(500).json('Error on getDonations' + error)
  }
}

const deleteDonation = async (req, res) => {
  addHeadersToResponse(res)

  try {
    const client = await db.connect()
    if (!req.params.id) {
      return res.sendStatus(501)
    } else {
      await client.query('DELETE from donations WHERE id = $1', [ req.params.id ])
    }
    client.release()
    return res.sendStatus(204)
  } catch (error) {
    return res.status(500).json('Error on deleteKilometers' + error)
  }
}

const getStats = async (req, res) => {
  addHeadersToResponse(res)

  try {
    const client = await db.connect()
    const [ kilometers, donations ] = await Promise.all([
      client.query('SELECT SUM("kilometers") from kilometers'),
      client.query('SELECT SUM("amount") from donations')
    ])
    client.release()
    return res.status(200).json({
      donations: donations.rows[0].sum || 0,
      kilometers: kilometers.rows[0].sum || 0,
    })
  } catch (error) {
    return res.status(500).json('Error on getStats' + error)
  }
}

const getTop10 = async (req, res) => {
  addHeadersToResponse(res)

  try {
    const client = await db.connect()
    const [ kilometers, donations ] = await Promise.all([
      client.query('SELECT "kilometers", "name" from kilometers ORDER BY kilometers DESC LIMIT 10'),
      client.query('SELECT "amount", "name" from donations ORDER BY amount DESC LIMIT 10')
    ])
    client.release()
    return res.status(200).json({
      donations: donations.rows,
      kilometers: kilometers.rows,
    })
  } catch (error) {
    return res.status(500).json('Error on getTop10' + error)
  }
}

module.exports = {
  addKilometers,
  addDonation,
  deleteKilometers,
  deleteDonation,
  getKilometers,
  getDonations,
  getStats,
  getTop10,
  signIn,
}
