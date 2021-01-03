import express from 'express'

export default ({ auth }) => {
  function getUserInfo(req, res) {
    const user = { ...(req.user || {}) }
    delete user.password
    res.json(user)
  }

  function loginWithPassword(req, res) {
    return getUserInfo(req, res)
  }

  function logout(req, res) {
    auth.logout(res)
    res.json({})
  }

  const router = express.Router()

  router.get('/', auth.requireJWT({ allowAnonymous: true }), getUserInfo)
  router.post('/', auth.requireLogin(), loginWithPassword)
  router.get('/logout', logout)

  return router
}
