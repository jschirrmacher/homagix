/*eslint-env mocha*/
import should from 'should'
import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import SessionRouter from './SessionRouter'

const app = express()
const log = []
const testUser = {
  id: 4711,
  email: 'test@example.com',
  access_code: 'test-access-code',
}

const auth = {
  requireJWT() {
    return function (req, res, next) {
      log.push('auth.requireJWT')
      if (req.headers.authorization === 'test-token') {
        req.user = testUser
      }
      next()
    }
  },

  requireLogin() {
    return function (req, res, next) {
      log.push('auth.requireLogin')
      if (
        req.body.email === 'test@example.com' &&
        req.body.password === 'test-password'
      ) {
        req.user = testUser
      }
      next()
    }
  },

  signIn() {
    log.push('auth.signIn')
    return 'test-token'
  },

  logout() {
    log.push('auth.logout')
  },
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const router = SessionRouter({ express, auth })
app.use('/session', router)

describe('SessionRouter', () => {
  beforeEach(() => {
    log.length = 0
  })

  describe('GET /session', () => {
    it('should report if a user is not logged in', () => {
      return request(app)
        .get('/session')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          should(response.body.id).be.undefined()
        })
    })

    it('should retrieve info about the logged in user', () => {
      return request(app)
        .get('/session')
        .set('authorization', 'test-token')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          response.body.should.deepEqual({
            id: 4711,
            email: 'test@example.com',
            access_code: 'test-access-code',
          })
        })
    })
  })

  describe('POST /session', () => {
    it('should log in users', () => {
      return request(app)
        .post('/session')
        .set('Content-Type', 'application/json')
        .send(
          JSON.stringify({
            email: 'test@example.com',
            password: 'test-password',
          })
        )
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          response.body.should.deepEqual(testUser)
          log.should.deepEqual(['auth.requireLogin'])
        })
    })
  })

  describe('GET /session/logout', () => {
    it(`should invalidate the user's session`, () => {
      return request(app)
        .get('/session/logout')
        .expect(200)
        .then(() => {
          log.should.deepEqual(['auth.logout'])
        })
    })
  })
})
