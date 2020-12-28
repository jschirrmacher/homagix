import express from 'express'

export default ({ auth, models }) => {
  function register(req, res, next) {
    try {
      if (models.user.getByEMail(req.body.email, false)) {
        throw { message: 'User already exists', httpStatus: 409 }
      }
      const user = {
        firstName: req.body.firstName,
        email: req.body.email,
        password: req.body.password,
      }
      auth.register(user, req, res)
      const result = { ...(req.user || {}) }
      delete result.password
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  const router = express.Router()
  router.post('/', register)
  return router
}
