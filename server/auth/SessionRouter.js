import express from 'express'

export default ({ auth }) => {
  function getUserInfo(req, res) {
    const user = req.user || {}
    user.loggedIn = !!user.id
    res.json(user)
  }

  async function login(req, res) {
    res.json({ token: auth.signIn(req, res) })
  }

  function logout(req, res) {
    auth.logout(res)
    res.redirect('/')
  }

  const router = express.Router()

  router.get('/', auth.requireJWT({ allowAnonymous: true }), getUserInfo)
  router.post('/', auth.requireLogin(), login)
  router.get('/logout', logout)

  return router
}
