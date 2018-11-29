/*eslint-env mocha, node*/

require('should')
const DishProposer = require('./DishProposer')

class MockModel {
  constructor() {
    this.ids = [1, 8, 12, 17, 23, 25, 29, 43, 44].map(id => ({id, ingredients: []}))
  }

  getDishes(num) {
    return this.ids.slice(0, num)
  }
}

describe('DishProposer', () => {
  it('should propose 7 dishes', done => {
    const proposer = new DishProposer({model: new MockModel()})
    proposer.get().dishes.map(d => d.id).should.deepEqual([1, 8, 12, 17, 23, 25, 29])
    done()
  })

  it('should propose 7 dishes with some ids inhibited', done => {
    const proposer = new DishProposer({model: new MockModel()})
    proposer.get({inhibit: [12, 1, 33]}).dishes.map(d => d.id).should.deepEqual([8, 17, 23, 25, 29, 43, 44])
    done()
  })
})
