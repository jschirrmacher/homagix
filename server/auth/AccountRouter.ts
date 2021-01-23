import express, { NextFunction, Request, Response, Router } from 'express'
import { Store } from '../EventStore/EventStore'
import HTTPError from '../lib/HTTPError'
import { Mailer } from '../Mailer'
import { Models } from '../models'
import { User } from '../models/user'
import { Auth, AuthUser } from './auth'

function sendUserInfo(req: Request, res: Response): void {
  const result = { ...(req.user || {}) } as AuthUser
  delete result.password
  res.json(result)
}

export default ({ auth, models, store, mailer }: { auth: Auth, models: Models, store: Store, mailer: Mailer}): Router => {
  const { invitationAccepted } = models.getEvents()

  async function registerNewUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  async function sendAccessLink(req: Request, res: Response, next: NextFunction) {
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

  function resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      auth.signIn(req.user as User, req, res)
      res.redirect('/setPassword')
    } catch (error) {
      next(error)
    }
  }

  function updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      auth.setPassword(req.user as User, req.body.password)
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
