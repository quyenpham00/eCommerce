'use strict'

const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../utils/asyncHandler')
const { AuthFailError, NotFoundError } = require('../core/error.response')
const KeyTokenService = require('../services/keyToken.service')

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rtoken-id',
}

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    //access token
    const accessToken = await JWT.sign(payload, publicKey, {
      algorithm: 'HS256',
      expiresIn: '2 days',
    })

    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: 'HS256',
      expiresIn: '7 days',
    })

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err)
      } else {
        console.log(`decode verify::`, decode)
      }
    })

    return { accessToken, refreshToken }
  } catch (error) {
    console.error(`error token::`, error)
  }
}

const authenticate = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailError('Invalid Request')

  const keyStore = await KeyTokenService.findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not Found Key store')

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailError('Invalid Access Token')

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId != decodeUser.userId) throw new AuthFailError('Invalid User')

    req.keyStore = keyStore
    return next()
  } catch (error) {
    throw error
  }
})

const authenticateV2 = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailError('Invalid Request')

  const keyStore = await KeyTokenService.findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not Found Key store')

  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN]
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
      if (userId != decodeUser.userId) throw new AuthFailError('Invalid User')

      req.keyStore = keyStore
      req.user = decodeUser
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      throw error
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailError('Invalid Access Token')

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId != decodeUser.userId) throw new AuthFailError('Invalid User')

    req.keyStore = keyStore
    return next()
  } catch (error) {
    throw error
  }
})

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authenticate,
  verifyJWT,
  authenticateV2,
}
