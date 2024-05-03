'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')

//count Connect
const countConnect = () => {
  const numConnection = mongoose.connections.length
  console.log(`Connects:: ${numConnection}`)
}

//check overload
const _SECONDS = 5000
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length
    const numCores = os.cpus().length
    const memoryUsage = process.memoryUsage().rss

    //Example maximum of connection based og number of cores
    const maxConnections = numCores * 5
    console.log(`Active connections: ${numConnection}`)
    console.log(`Memory usage: ${memoryUsage / 1024 / 204} MB`)

    if (numConnection > maxConnections) {
      console.log(`Connection overloaded`)
    }
  }, _SECONDS)
}

module.exports = {
  countConnect,
  checkOverload,
}
