'use strict'

const AccessService = require('../services/access.service')

const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    //   message: 'Get token successfully',
    // }).send(res)

    new SuccessResponse({
      metadata: await AccessService.handleRefreshTokenV2({
        refreshToken: req.refreshToken,
        keyStore: req.keyStore,
        user: req.user,
      }),
      message: 'Get token successfully',
    }).send(res)
  }

  logout = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.logout(req.keyStore),
    }).send(res)
  }

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res)
  }

  signUp = async (req, res, next) => {
    new CREATED({
      message: 'Registered successfully',
      metadata: await AccessService.signUp(req.body),
    }).send(res)
  }
}

module.exports = new AccessController()
