const mongoose = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'
// Declare the Schema of the Mongo model
var productShema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ['Electronic', 'Clothing', 'Furniture'],
    },
    product_shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    product_attributes: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
)

const clothingSheme = new Scheme(
  {
    brand: { type: String, require: true },
    size: String,
    material: String,
  },
  {
    collection: 'clothes',
    timestamps: true,
  }
)

const electronicSheme = new Scheme(
  {
    manufacturer: { type: String, require: true },
    model: String,
    color: String,
  },
  {
    collection: 'electronics',
    timestamps: true,
  }
)

//Export the model
module.exports = {
  product: mongoose.model(DOCUMENT_NAME, productShema),
  electronic: mongoose.model('Electronics', electronicSheme),
  clothing: mongoose.model('Clothing', clothingSheme),
}
