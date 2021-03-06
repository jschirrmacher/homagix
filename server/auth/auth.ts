import passport from 'passport'
import LoginStrategy from './LoginStrategy'
import AccessCodeStrategy from './AccessCodeStrategy'
import { Strategy as JwtStrategy } from 'passport-jwt'
import 'express-session'
import bcrypt from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'
import md5 from 'md5'
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express'
import { Store } from '../EventStore/EventStore'
import { Models } from '../models'
import { User } from '../models/user'

export type DoneFunction = (error: string | null, user: User | false) => void
export type AuthUser = User & { accessCode?: string; password?: string }
export type MiddleWare = (options?: Record<string, unknown>) => RequestHandler

type NewUser = {
  firstName: string
  email: string
  password: string
}

export type Auth = {
  signIn(user: User, req: Request, res: Response): void
  register(user: NewUser, req: Request, res: Response): User
  setPassword(user: AuthUser, newPassword: string): void
  logout: (req: Response) => void
  generateAccessCode(user: AuthUser): void
  resetAccessCode(user: AuthUser): void

  authenticate(
    type: string | string[],
    options: { allowAnonymous?: boolean }
  ): RequestHandler
  requireCode: MiddleWare
  requireJWT: MiddleWare
  checkJWT: MiddleWare
  requireLogin: MiddleWare
  requireAuth: MiddleWare
  requireAdmin: MiddleWare
}

export default ({
  app,
  models,
  store,
  secretOrKey,
}: {
  app: Router
  models: Models
  store: Store
  secretOrKey: string
}): Auth => {
  const { userAdded, userChanged } = models.user.events

  function signIn(user: User, req: Request, res: Response): void {
    const roles = [] as string[]
    if (user.isAdmin) {
      roles.push('admin')
    }
    const token = jsonwebtoken.sign(
      {
        sub: user.id,
        firstName: user.firstName,
        roles,
      },
      secretOrKey,
      { expiresIn: '24h' }
    )
    res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 })
    req.user = user
  }

  function register(newUser: NewUser, req: Request, res: Response): User {
    const user = {
      ...newUser,
      id: md5(process.hrtime()),
      password: bcrypt.hashSync(newUser.password, 10),
    }
    store.emit(userAdded(user))
    signIn(user, req, res)
    return user
  }

  function logout(res: Response): void {
    res.cookie('token', '', { maxAge: -1 })
  }

  function generateAccessCode(user: AuthUser): void {
    user.accessCode = md5(process.hrtime())
    store.emit(userChanged(user.id, user))
  }

  function resetAccessCode(user: AuthUser): void {
    user.accessCode = ''
    store.emit(userChanged(user.id, user))
  }

  function jwtFromRequest(req: Request) {
    return (req.cookies && req.cookies.token) || req.headers.authorization
  }

  function setPassword(user: AuthUser, newPassword: string): void {
    user.password = bcrypt.hashSync(newPassword, 10)
    user.accessCode = ''
    store.emit(userChanged(user.id, user))
  }

  passport.use(
    new LoginStrategy(
      (
        email: string,
        username: string,
        password: string,
        done: DoneFunction
      ) => {
        try {
          const user = models.user.getByEMail(email) as AuthUser
          bcrypt.compare(password, user.password || '', (err, isValid) => {
            done(err && err.message, isValid ? user : false)
          })
        } catch (error) {
          done(error, false)
        }
      }
    )
  )

  passport.use(
    new JwtStrategy(
      { jwtFromRequest, secretOrKey },
      (payload: { sub: string }, done: DoneFunction) => {
        try {
          const user = models.user.getById(payload.sub)
          done(null, user)
        } catch (error) {
          done(error, false)
        }
      }
    )
  )

  passport.use(
    new AccessCodeStrategy(
      (accessCode: string, id: string, done: DoneFunction) => {
        try {
          const user = models.user.getById(id) as AuthUser
          if (user && user.accessCode === accessCode) {
            done(null, user)
          } else {
            done('unknown access code', false)
          }
        } catch (error) {
          done(error, false)
        }
      }
    )
  )

  function authenticate(
    type: string | string[],
    options = {} as { allowAnonymous?: boolean }
  ): RequestHandler {
    return function (req: Request, res: Response, next: NextFunction): void {
      passport.authenticate(type, { session: false }, (err, user) => {
        if (err) {
          return next(err)
        } else if (!req.user && !user && !options.allowAnonymous) {
          res.status(401).json({ error: 'Not authenticated' })
        } else if (!req.user && user) {
          signIn(user, req, res)
          next()
        } else {
          next()
        }
      })(req, res, next)
    }
  }

  app.use(passport.initialize())
  app.use(passport.session())

  const requireCode = (options = {}) => authenticate('access_code', options)
  const checkJWT = (options = {}) =>
    authenticate('jwt', { ...options, allowAnonymous: true })
  const requireJWT = (options = {}) => authenticate('jwt', options)
  const requireLogin = (options = {}) => authenticate('login', options)

  function requireAuth() {
    return (req: Request, res: Response, next: NextFunction) =>
      req.user ? next() : next({ status: 401, message: 'Not authenticated' })
  }

  function requireAdmin() {
    return function (req: Request, res: Response, next: NextFunction) {
      if (
        (!req.user || !(req.user as { isAdmin: boolean }).isAdmin) &&
        models.user.adminIsDefined
      ) {
        next({ status: 403, message: 'Not allowed' })
      } else {
        next()
      }
    }
  }

  return {
    authenticate,
    signIn,
    register,
    setPassword,
    logout,
    generateAccessCode,
    resetAccessCode,

    requireCode,
    requireJWT,
    checkJWT,
    requireLogin,
    requireAuth,
    requireAdmin,
  }
}
