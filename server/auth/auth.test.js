/*eslint-env mocha*/
import should from 'should'
import jsonwebtoken from 'jsonwebtoken'
import AuthFactory from './auth.js'

const app = {
  use() {}
}
const Model = {}
const users = [
  {id: 4711, email: 'test@example.com', access_code: 'test-access-1', password: '$2a$10$5cblct/kPaZQ5uh9jNKIVu8.oGiOPDPGB4iZRdNp0E1miYl6jTqXm'},
  {id: 4712, email: 'test2@example.com'},
  {id: 4713, email: 'test3@example.com', access_code: 'test-access', hash: 'test-hash'}
]
const models = {
  user: {
    getByEMail(email) {
      const user = users.find(user => user.email === email)
      if (user) {
        return user
      }
      throw `No user found with this e-mail address`
    },
    getById(id) {
      const user = users.find(user => user.id === id)
      if (user) {
        return user
      }
      throw `No user found with this id`
    },
    adminIsDefined: true
  }
}

const storedData = []
const store = {
  emit(entry) {
    storedData.push(entry)
  }
}

const secretOrKey = 'secret-key'

const auth = AuthFactory({app, Model, models, store, secretOrKey})

function expect(expected) {
  if (typeof expected === 'function') {
    return expected
  } else {
    return data => data.should.deepEqual(expected)
  }
}

function checkCookie(name, value) {
  name.should.equal('token')
  jsonwebtoken.verify(value, secretOrKey, (err, decoded) => {
    should(err).be.null()
    decoded.should.have.properties(['iat', 'exp'])
  })
}

function makeExpectedResult(expectedValues = {}) {
  const res = {
    status: wrap(expectedValues, 'status'),
    json: wrap(expectedValues, 'json'),
    cookie: wrap(expectedValues, 'cookie'),
    called: {status: false, json: false, cookie: false}
  }

  function wrap(expectedValues, name) {
    const func = expectedValues[name] ? expect(expectedValues[name]) : () => {}
    return (...args) => {
      res.called[name] = true
      func(...args)
      return res
    }
  }

  return res
}

describe('auth', () => {
  describe('requireLogin', () => {
    it('should authenticate with e-mail and password', done => {
      const middleware = auth.requireLogin()
      const req = {body: {email: 'test@example.com', password: 'test-pwd'}}
      const res = makeExpectedResult()
      middleware(req, res, err => {
        should(err).be.undefined()
        req.user.should.have.property('id')
        req.user.id.should.equal(4711)
        done()
      })
    })

    it('should generate a JWT if authenticated with e-mail and password', done => {
      const middleware = auth.requireLogin()
      const req = {body: {email: 'test@example.com', password: 'test-pwd'}}
      const res = makeExpectedResult({cookie: checkCookie})
      middleware(req, res, () => {
        res.called.cookie.should.be.true()
        done()
      })
    })

    it('should not authenticate with e-mail and wrong password', done => {
      const middleware = auth.requireLogin()
      const req = {body: {email: 'test@example.com', password: 'wrong-pwd'}}
      const res = makeExpectedResult({status: 401, json: {error: 'Not authenticated'}})
      middleware(req, res, () => should().fail())
      done()
    })
  })

  describe('requireJWT', () => {
    it('should authenticate with JWT in header', done => {
      const middleware = auth.requireJWT()
      const authorization = jsonwebtoken.sign({sub: 4712}, secretOrKey, {expiresIn: '24h'})
      const req = {body: {email: 'test3@example.com'}, headers: {authorization}}
      const res = makeExpectedResult()
      middleware(req, res, err => {
        should(err).be.undefined()
        req.user.should.have.property('id')
        req.user.id.should.equal(4712)
        done()
      })
    })

    it('should authenticate with JWT in cookie', done => {
      const middleware = auth.requireJWT()
      const token = jsonwebtoken.sign({sub: 4712}, secretOrKey, {expiresIn: '24h'})
      const req = {body: {email: 'test3@example.com'}, cookies: {token}}
      const res = makeExpectedResult()
      middleware(req, res, err => {
        should(err).be.undefined()
        req.user.should.have.property('id')
        req.user.id.should.equal(4712)
        done()
      })
    })
  })

  describe('requireAdmin', () => {
    it('should require a user to be admin', done => {
      models.user.adminIsDefined = true
      const middleware = auth.requireAdmin()
      const req = {user: {id: 4711}}
      const res = makeExpectedResult({status: 403, message: 'Not allowed'})
      middleware(req, res, err => {
        err.should.deepEqual({status: 403, message: 'Not allowed'})
        done()
      })
    })

    it('should allow access for admins', done => {
      models.user.adminIsDefined = true
      const middleware = auth.requireAdmin()
      const req = {user: {id: 4712, isAdmin: true}}
      const res = makeExpectedResult()
      middleware(req, res, err => {
        should(err).be.undefined()
        done()
      })
    })

    it('should allow access if no admin is defined', done => {
      models.user.adminIsDefined = false
      const middleware = auth.requireAdmin()
      const req = {user: {id: 4711}}
      const res = makeExpectedResult()
      middleware(req, res, err => {
        should(err).be.undefined()
        models.user.adminIsDefined = true
        done()
      })
    })
  })

  it('should clear the cookie if logged out', done => {
    let cookieIsCleared = false
    auth.logout({
      cookie(name, value) {
        name.should.equal('token')
        should(value).equal('')
        cookieIsCleared = true
      }
    })
    cookieIsCleared.should.be.true()
    done()
  })

  it('should change the password', async () => {
    storedData.length = 0
    const user = models.user.getById(4713)
    await auth.setPassword(user, 'new-password')
    storedData.length.should.equal(1)
    storedData[0].should.have.properties(['type', 'id', 'user'])
    storedData[0].type.should.equal('userChanged')
    storedData[0].id.should.equal(4713)
    storedData[0].user.password.should.startWith('$2a$10$')
  })

  it('should clear the access code after setting the password', async () => {
    storedData.length = 0
    const user = models.user.getById(4713)
    await auth.setPassword(user, 'new-password')
    storedData[0].user.accessCode.should.equal('')
  })
})
