const express = require('express')
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')
require('dotenv').config()
const app = express()

//init middleware
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

//init db
require('./dbs/init.mongodb.js')
// const { checkOverload } = require('./helpers/check.connect.js')
// const { log } = require('node-red')
// checkOverload()
//init routes
app.use('', require('./routers'))
//handle errors

module.exports = app
