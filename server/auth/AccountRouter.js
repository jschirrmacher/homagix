import express from 'express'
import HTTPError from '../lib/HTTPError.js'

function sendUserInfo(req, res) {
  const result = { ...(req.user || {}) }
  delete result.password
  res.json(result)
}

export default ({ auth, models, store, mailer }) => {
  const { invitationAccepted } = models.getEvents()

  async function registerNewUser(req, res, next) {
    try {
      if (models.user.getByEMail(req.body.email, false)) {
        throw new HTTPError(409, 'User already exists')
      }
      const user = {
        firstName: req.body.firstName,
        email: req.body.email,
        password: req.body.password,
      }
      auth.register(user, req, res)
      if (req.body.inviteFrom) {
        await store.emit(invitationAccepted(user, req.body.inviteFrom))
      }
      sendUserInfo(req, res)
    } catch (error) {
      next(error)
    }
  }

  async function sendAccessLink(req, res, next) {
    try {
      const user = models.user.getByEMail(req.body.email, false)
      if (user) {
        auth.generateAccessCode(user)
        await mailer.send(req.body.email, 'LostPasswordMail', { user })
      }
      res.json({})
    } catch (error) {
      next(error)
    }
  }

  function resetPassword(req, res, next) {
    try {
      auth.signIn(req.user, req, res)
      res.redirect('/setPassword')
    } catch (error) {
      next(error)
    }
  }

  function updatePassword(req, res, next) {
    try {
      auth.setPassword(req.user, req.body.password)
      sendUserInfo(req, res)
    } catch (error) {
      next(error)
    }
  }

  const router = express.Router()
  router.post('/accessLinks', sendAccessLink)
  router.get('/:id/access-codes/:accessCode', auth.requireCode(), resetPassword)
  router.patch('/:id', auth.requireJWT(), updatePassword)
  router.post('/', registerNewUser)
  return router
}
