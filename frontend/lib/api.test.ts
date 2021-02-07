import should from 'should'
import fetch, { RequestInit as FetchInit } from 'node-fetch'
import nock from 'nock'
import * as api from './api'

const baseName = 'http://test'
api.setBaseUrl(baseName)

const emptyFunc = () => {
  // Don't to anything
}

const state = {
  accepted: [1, 2],
  declined: [3, 4],
}

describe('api', () => {
  before(() => {
    global.fetch = (input: RequestInfo, init?: RequestInit) => fetch(input.toString(), init as FetchInit) as unknown as Promise<Response>
  })

  describe('doFetch()', () => {
    it('should fetch from the url', async () => {
      const request = nock(baseName).get('/route').reply(200, { data: true })
      await api.doFetch('get', '/route')
      request.isDone().should.be.true()
    })

    it('should return the requests payload as an object', async () => {
      nock(baseName).get('/route').reply(200, { data: true })
      const result = await api.doFetch('get', '/route')
      result.should.deepEqual({ data: true })
    })

    it('should send query parameters for GET method', async () => {
      const request = nock(baseName)
        .get('/route')
        .query({ data: true })
        .reply(200, { success: true })
      await api.doFetch('get', '/route', { data: 'true' })
      request.isDone().should.be.true()
    })

    it('should send parameters as JSON in body for POST method', async () => {
      const request = nock(baseName)
        .post('/route', { data: 'true' })
        .reply(200, { success: true })
      const response = (await api.doFetch('post', '/route', { data: 'true' }))
      should(response.error).be.undefined()
      response.should.have.property('success')
      should(response['success']).be.true()
      request.isDone().should.be.true()
    })

    it('should report errors as an object', async () => {
      nock(baseName)
        .get('/route')
        .replyWithError({ message: 'something aweful happened', code: 403 })
      const result = await api.doFetch('get', '/route')
      result.should.deepEqual({
        httpStatus: 403,
        error:
          'request to http://test/route failed, reason: something aweful happened',
      })
    })
  })

  describe('loadData()', () => {
    it('should prepare GET parameters', async () => {
      const context = { state, commit: emptyFunc }
      const request = nock(baseName)
        .get('/route?accepted=1,2&inhibit=3,4')
        .reply(200, { success: true })
      await api.loadData('/route', 'mutation')(context)
      request.isDone().should.be.true()
    })

    it('should commit the result with the given mutation type', async () => {
      const context = {
        state,
        commit(...args) {
          args.should.deepEqual(['mutation', { success: true }])
        },
      }
      const request = nock(baseName)
        .get('/route?accepted=1,2&inhibit=3,4')
        .reply(200, { success: true })
      await api.loadData('/route', 'mutation')(context)
      request.isDone().should.be.true()
    })
  })
})
