export const testUser = { id: '42', listId: '007' }
export const testAdmin = { id: '007', isAdmin: true }
export const validToken = 'user-token'
export const adminToken = 'admin-token'

function readToken(req) {
  const match = req.headers?.authorization?.match(/Bearer (.*)/)
  if (match && match.length === 2) {
    const token = match[1]
    if (token === validToken) {
      req.user = testUser
    } else if (token === adminToken) {
      req.user = testAdmin
    }
  }
}

function requireAuth(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.status(401).json({ error: 'Not authenticated' })
  }
}

const auth = {
  checkJWT: () => (req, res, next) => {
    readToken(req)
    next()
  },
  
  requireAuth,

  requireJWT: () => (req, res, next) => {
    readToken(req)
    requireAuth(req, res, next)
  }
}

export default auth
