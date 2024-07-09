'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailError,
  ForbiddenError,
} = require('../core/error.response')

const { findEmail } = require('./shop.service')
const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
}

class AccessService {
  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user
    //check xem token da duoc su dung chua
    //neu co, xoa tat ca keystore
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something went wrong, please try again')
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailError('Shop not registered')
    }

    const foundShop = await findEmail({ email })
    if (!foundShop) {
      throw new AuthFailError('Shop not registered')
    }

    const tokens = await createTokenPair(
      { userId: foundShop._id, email: foundShop.email },
      keyStore.publicKey,
      keyStore.privateKey
    )

    //update token
    await KeyTokenService.updateRefreshToken({
      userId,
      refreshToken,
      newRefeshToken: tokens.refreshToken,
    })

    return {
      user,
      tokens,
    }
  }

  static handleRefreshToken = async (refreshToken) => {
    //check xem token da duoc su dung chua
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    )

    //neu co, xoa tat ca keystore
    if (foundToken) {
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      )
      console.log({ userId, email })

      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something went wrong, please try again')
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    if (!holderToken) {
      throw new AuthFailError('Shop not registered')
    }

    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    )
    const foundShop = await findEmail({ email })
    if (!foundShop) {
      throw new AuthFailError('Shop not registered')
    }

    const tokens = await createTokenPair(
      { userId: foundShop._id, email: foundShop.email },
      holderToken.publicKey,
      holderToken.privateKey
    )

    //update token
    await KeyTokenService.updateRefreshToken({
      userId,
      refreshToken,
      newRefeshToken: tokens.refreshToken,
    })

    return {
      user: { userId: userId, email: email },
      tokens,
    }
  }

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    console.log(delKey)
    return delKey
  }

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findEmail({ email })
    if (!foundShop) throw new BadRequestError('Shop not registered')

    const match = bcrypt.compare(password, foundShop.password)
    if (!match) throw new AuthFailError('Authentication error')

    const publicKey = crypto.randomBytes(64).toString('hex')
    const privateKey = crypto.randomBytes(64).toString('hex')

    const tokens = await createTokenPair(
      { userId: foundShop._id, email: foundShop.email },
      publicKey,
      privateKey
    )

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey: privateKey,
      publicKey: publicKey,
      userId: foundShop._id,
    })

    return {
      shop: getInfoData({
        fileds: ['_id', 'name', 'email'],
        object: foundShop,
      }),
      tokens,
    }
  }

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
