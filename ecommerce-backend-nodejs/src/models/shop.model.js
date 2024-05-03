'use strict'

//!mdbgum
const mongoose = require('mongoose')

const DOCUMENT_NAME = 'Shop'
const COLLECTION_NAME = 'Shops'

// Declare the Schema of the Mongo model
var shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    verify: {
      type: mongoose.Schema.Types.Boolean,
      default: false,
    },
    roles: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
)

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, shopSchema)
