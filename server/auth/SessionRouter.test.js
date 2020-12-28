/*eslint-env mocha*/
import 'should'
import request from 'supertest'
import express from 'express'
import SessionRouter from './SessionRouter.js'

const app = express()
const log = []
const testUser = {
  id: 4711,
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
      next()
    }
  },

  signIn() {
    log.push('auth.signIn')
    return 'test-token'
  },

  logout() {
    log.push('auth.logout')
  }
}

const router = SessionRouter({express, auth})
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
          response.body.id.should.be.undefined()
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
            access_code: 'test-access-code'
          })
        })
    })
  })

  describe('POST /session', () => {
    it('should log in users', () => {
      return request(app)
        .post('/session')
        .field('email', 'test@example.com')
        .field('password', 'test-pasword')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          response.body.should.deepEqual({token: 'test-token'})
          log.should.deepEqual(['auth.requireLogin', 'auth.signIn'])
        })
    })
  })

  describe('GET /session/logout', () => {
    it(`should invalidate the user's session`, () => {
      return request(app)
        .get('/session/logout')
        .expect(302)
        .expect('location', '/')
        .then(() => {
          log.should.deepEqual(['auth.logout'])
        })
    })
  })
})
