/*eslint-env mocha, node*/

require('should')
const DishProposer = require('./DishProposer')

class MockModel {
  constructor() {
    this.ingredients = {
      101: {id: 101, name: 'a'},
      108: {id: 108, name: 'b'}
    }
    this.dishes = [
      {id: 1, name: 'A', last: '2018-09-01', ingredients: [{ingredient: 101, amount: 1, unit: 'L'}]},
      {id: 8, name: 'B', last: '2018-09-02', ingredients: [{ingredient: 108, amount: 2, unit: 'ml'}]},
      {id: 12, name: 'C', last: '2018-09-03', ingredients: [{ingredient: 101, amount: 4, unit: 'L'}]},
      {id: 17, name: 'D', last: '2018-08-01', ingredients: []},
      {id: 23, name: 'E', last: '2018-09-04', ingredients: []},
      {id: 25, name: 'F', last: '2018-09-05', ingredients: []},
      {id: 29, name: 'G', last: '2018-09-06', ingredients: []},
      {id: 43, name: 'H', last: '2018-08-02', ingredients: []},
      {id: 44, name: 'I', last: '2018-09-01', ingredients: []}
    ]
  }

  getDishes(num) {
    return this.dishes.slice(0, num)
  }

  getIngredient(id) {
    return this.ingredients[id]
  }
}

describe('DishProposer', () => {
  it('should return a data structure containing dishes and ingredients', done => {
    const proposer = new DishProposer({model: new MockModel()})
    const result = proposer.get()
    result.should.have.property('dishes')
    result.should.have.property('ingredients')
    done()
  })

  it('should propose the 7 dishes which are the longest not served', done => {
    const proposer = new DishProposer({model: new MockModel()})
    proposer.get().dishes.map(d => d.id).should.deepEqual([17, 43, 1, 44, 8, 12, 23])
    done()
  })

  it('should propose 7 dishes with some ids inhibited', done => {
    const proposer = new DishProposer({model: new MockModel()})
    proposer.get([12, 1, 33]).dishes.map(d => d.id).should.deepEqual([17, 43, 44, 8, 23, 25, 29])
    done()
  })

  it('should return no ingredients as long there are no accepted dishes', done => {
    const proposer = new DishProposer({model: new MockModel()})
    proposer.get().ingredients.length.should.equal(0)
    done()
  })

  it('should return ingredients only of accepted dishes', done => {
    const proposer = new DishProposer({model: new MockModel()})
    proposer.get([], [1]).ingredients.should.deepEqual([{id: 101, name: 'a', amount: 1, unit: 'L'}])
    done()
  })

  it('should add amounts of ingredients', done => {
    const proposer = new DishProposer({model: new MockModel()})
    proposer.get([], [1, 12]).ingredients.should.deepEqual([{id: 101, name: 'a', amount: 5, unit: 'L'}])
    done()
  })
})
