/*eslint-env mocha*/
import should from 'should'
import jsonwebtoken from 'jsonwebtoken'
import AuthFactory from './auth'
import Store from '../EventStore/Store.mock'
import Models from '../models/MockedModel'
import { User } from '../models/user'
import express from 'express'
import { mockRequest, mockResponse } from 'mock-req-res'

const app = express()
const store = Store()
const models = Models({ store })
const users = [
  {
    id: '4711',
    firstName: 'Test',
    email: 'test@example.com',
    access_code: 'test-access-1',
    password: '$2a$10$5cblct/kPaZQ5uh9jNKIVu8.oGiOPDPGB4iZRdNp0E1miYl6jTqXm',
  },
  { id: '4712', firstName: 'Test2', email: 'test2@example.com' },
  {
    id: '4713',
    firstName: 'Test3',
    email: 'test3@example.com',
    access_code: 'test-access',
    hash: 'test-hash',
    isAdmin: true
  },
]
users.forEach(user => store.emit(models.getEvents().userAdded(user)))

const secretOrKey = 'secret-key'
const auth = AuthFactory({ app, models, store, secretOrKey })

function userId(user: Express.User | undefined): string {
  should(user).not.be.undefined()
  user && user.should.have.property('id')
  return (user as { id: string })?.id
}

describe('auth', () => {
  describe('requireLogin', () => {
    it('should authenticate with e-mail and password', done => {
      const middleware = auth.requireLogin()
      const req = mockRequest({
        body: { email: 'test@example.com', password: 'test-pwd' },
        user: undefined as User | undefined,
      })
      const res = mockResponse()
      middleware(req, res, (err: unknown) => {
        should(err).be.undefined()
        userId(req.user).should.equal('4711')
        done()
      })
    })

    it('should generate a JWT if authenticated with e-mail and password', done => {
      const middleware = auth.requireLogin()
      const req = mockRequest({
        body: { email: 'test@example.com', password: 'test-pwd' },
      })
      const res = mockResponse()
      middleware(req, res, () => {
        res.cookie.calledOnce.should.be.true()
        res.cookie.args[0][1].should.not.be.empty()
        jsonwebtoken.verify(
          res.cookie.args[0][1],
          secretOrKey,
          (err: unknown, decoded) => {
            should(err).be.null()
            decoded?.should.have.properties(['iat', 'exp'])
            done()
          }
        )
      })
    })

    it('should not authenticate with e-mail and wrong password', done => {
      const middleware = auth.requireLogin()
      const req = mockRequest({
        body: { email: 'test@example.com', password: 'wrong-pwd' },
      })
      const res = mockResponse()
      middleware(req, res, () => {
        should({}).fail()
      })
      setTimeout(() => {
        res.status.calledOnce.should.be.true()
        res.status.args[0][0].should.equal(401)
        res.json.calledOnceWith({ error: 'Not authenticated' }).should.be.true()
        done()
      }, 100)
    })
  })

  describe('checkJWT', () => {
    it('should add the user to the request if a valid JWT is found in the header', done => {
      const middleware = auth.checkJWT()
      const authorization = jsonwebtoken.sign({ sub: 4712 }, secretOrKey, {
        expiresIn: '24h',
      })
      const req = mockRequest({
        body: { email: 'test3@example.com' },
        headers: { authorization },
        user: undefined as User | undefined,
      })
      const res = mockResponse()
      middleware(req, res, (err: unknown) => {
        should(err).be.undefined()
        userId(req.user).should.equal('4712')
        done()
      })
    })

    it('should add the user to the request if a valid JWT is given in cookie', done => {
      const middleware = auth.requireJWT()
      const token = jsonwebtoken.sign({ sub: 4712 }, secretOrKey, {
        expiresIn: '24h',
      })
      const req = mockRequest({
        body: { email: 'test3@example.com' },
        cookies: { token },
        user: undefined as User | undefined,
      })
      const res = mockResponse()
      middleware(req, res, (err: unknown) => {
        should(err).be.undefined()
        userId(req.user).should.equal('4712')
        done()
      })
    })
  })

  describe('requireJWT', () => {
    it('should authenticate with JWT in header', done => {
      const middleware = auth.requireJWT()
      const authorization = jsonwebtoken.sign({ sub: 4712 }, secretOrKey, {
        expiresIn: '24h',
      })
      const req = mockRequest({
        body: { email: 'test3@example.com' },
        headers: { authorization },
        user: undefined as User | undefined,
      })
      const res = mockResponse()
      middleware(req, res, (err: unknown) => {
        should(err).be.undefined()
        userId(req.user).should.equal('4712')
        done()
      })
    })

    it('should authenticate with JWT in cookie', done => {
      const middleware = auth.requireJWT()
      const token = jsonwebtoken.sign({ sub: 4712 }, secretOrKey, {
        expiresIn: '24h',
      })
      const req = mockRequest({
        body: { email: 'test3@example.com' },
        cookies: { token },
        user: undefined as User | undefined,
      })
      const res = mockResponse()
      middleware(req, res, (err: unknown) => {
        should(err).be.undefined()
        userId(req.user).should.equal('4712')
        done()
      })
    })
  })

  describe('requireAdmin', () => {
    it('should require a user to be admin', done => {
      models.user.adminIsDefined = true
      const middleware = auth.requireAdmin()
      const req = mockRequest({ user: { id: 4711 } })
      const res = mockResponse({ status: 403, message: 'Not allowed' })
      middleware(req, res, (err: unknown) => {
        should(err).deepEqual({ status: 403, message: 'Not allowed' })
        done()
      })
    })

    it('should allow access for admins', done => {
      models.user.adminIsDefined = true
      const middleware = auth.requireAdmin()
      const req = mockRequest({ user: { id: 4712, isAdmin: true } })
      const res = mockResponse()
      middleware(req, res, (err: unknown) => {
        should(err).be.undefined()
        done()
      })
    })

    it('should allow access if no admin is defined', done => {
      models.user.adminIsDefined = false
      const middleware = auth.requireAdmin()
      const req = mockRequest({ user: { id: 4711 } })
      const res = mockResponse()
      middleware(req, res, (err: unknown) => {
        should(err).be.undefined()
        models.user.adminIsDefined = true
        done()
      })
    })
  })

  it('should clear the cookie if logged out', async () => {
    const response = mockResponse()
    auth.logout(response)
    response.cookie.calledOnce.should.be.true()
    response.cookie.args[0][0].should.equal('token')
    response.cookie.args[0][1].should.be.empty()
  })

  it('should change the password', async () => {
    const eventList = store.eventList()
    eventList.length = 0
    const user = models.user.getById('4713')
    auth.setPassword(user, 'new-password')
    eventList.length.should.equal(1)
    const event = eventList[0]
    event.should.have.properties(['type', 'id', 'user'])
    event.should.containDeep({ type: 'userChanged', id: '4713' })
    ;(event.user as { password: string }).password.should.startWith('$2a$10$')
  })

  it('should clear the access code after setting the password', async () => {
    store.eventList().length = 0
    const user = models.user.getById('4713')
    auth.setPassword(user, 'new-password')
    ;(store.eventList()[0].user as {
      accessCode: string
    }).accessCode.should.equal('')
  })
})
