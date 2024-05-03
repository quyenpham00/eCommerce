'use strict'

const mongoose = require('mongoose')
const { countConnect } = require('../helpers/check.connect.js')
const {
  db: { host, port, name },
} = require('../configs/config.mongodb.js')

const connectionString = `mongodb://${host}:${port}/${name}`
console.log(connectionString)

class Database {
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }

    mongoose
      .connect(connectionString)
      .then((_) => console.log('Connect', countConnect()))
      .catch((err) => console.log('Error Connecting'))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }

    return Database.instance
  }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb
