import passport from 'passport'
import LoginStrategy from './LoginStrategy.js'
import AccessCodeStrategy from './AccessCodeStrategy.js'
import { Strategy as JwtStrategy } from 'passport-jwt'
import 'express-session'
import bcrypt from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'
import md5 from 'md5'

export default ({ app, models, store, secretOrKey }) => {
  const { userAdded, userChanged } = models.getEvents()

  function signIn(user, req, res) {
    const token = jsonwebtoken.sign(
      {
        sub: user.id,
        firstName: user.firstName,
      },
      secretOrKey,
      { expiresIn: '24h' }
    )
    res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 })
    req.user = user
  }

  function register(user, req, res) {
    user.id = md5(process.hrtime())
    user.password = bcrypt.hashSync(user.password, 10)
    store.emit(userAdded(user))
    return signIn(user, req, res)
  }

  function logout(res) {
    res.cookie('token', '', { maxAge: -1 })
  }

  function generateAccessCode(user) {
    user.accessCode = md5(process.hrtime())
    store.emit(userChanged(user.id, user))
  }

  function resetAccessCode(user) {
    user.accessCode = ''
    store.emit(userChanged(user.id, user))
  }

  function jwtFromRequest(req) {
    return (req.cookies && req.cookies.token) || req.headers.authorization
  }

  function setPassword(user, newPassword) {
    user.password = bcrypt.hashSync(newPassword, 10)
    user.accessCode = ''
    store.emit(userChanged(user.id, user))
  }

  passport.use(
    new LoginStrategy(async (email, username, password, done) => {
      try {
        const user = email
          ? models.user.getByEMail(email)
          : models.user.getByAccessCode(username)
        bcrypt.compare(password, user.password, async (err, isValid) => {
          done(err, isValid ? user : false)
        })
      } catch (error) {
        done(error, false)
      }
    })
  )

  passport.use(
    new JwtStrategy({ jwtFromRequest, secretOrKey }, async (payload, done) => {
      try {
        const user = models.user.getById(payload.sub)
        done(null, user)
      } catch (error) {
        done(error, false)
      }
    })
  )

  passport.use(
    new AccessCodeStrategy(async (accessCode, id, done) => {
      try {
        const user = models.user.getById(id)
        if (user && user.accessCode === accessCode) {
          done(null, user)
        } else {
          done('unknown access code', false)
        }
      } catch (error) {
        done(error, false)
      }
    })
  )

  function authenticate(type, options = {}) {
    return function (req, res, next) {
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

  const requireCode = (options = {}) => authenticate(['access_code'], options)
  const requireJWT = (options = {}) => authenticate('jwt', options)
  const requireLogin = (options = {}) => authenticate('login', options)

  function requireAdmin() {
    return function (req, res, next) {
      if ((!req.user || !req.user.isAdmin) && models.user.adminIsDefined) {
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
    requireLogin,
    requireAdmin,
  }
}
