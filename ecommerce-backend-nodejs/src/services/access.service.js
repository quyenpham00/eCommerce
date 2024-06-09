'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const {
  BadRequestError,
  ConflictRequestError,
} = require('../core/error.response')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
}

class AccessService {
  static signUp = async ({ name, email, password }) => {
    // Check email exist
    const holderShop = await shopModel.findOne({ email }).lean()
    if (holderShop) {
      throw new BadRequestError(`shop already exists`)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    })

    if (newShop) {
      const publicKey = crypto.randomBytes(64).toString('hex')
      const privateKey = crypto.randomBytes(64).toString('hex')
      console.log({ privateKey, publicKey })
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey: publicKey,
        privateKey: privateKey,
      })

      if (!keyStore) {
        return {
          code: 'xxxx',
          message: 'publicKeystring error',
        }
      }

      //create token
      const tokens = await createTokenPair(
        { userId: newShop._id, email: newShop.email },
        publicKey,
        privateKey
      )

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fileds: ['_id', 'name', 'email'],
            object: newShop,
          }),
          tokens,
        },
      }
    }

    return {
      code: 200,
      metadata: null,
    }
  }
}

module.exports = AccessService
