/*eslint-env mocha, node*/

require('should')
const DishProposer = require('./DishProposer')

const allIngredients = {
  101: {id: 101, name: 'a'},
  108: {id: 108, name: 'b'}
}

const allDishes = {
  1: {id: 1, name: 'A', last: '2018-09-01', ingredients: [{id: 101, amount: 1, unit: 'L'}]},
  8: {id: 8, name: 'B', last: '2018-09-02', ingredients: [{id: 108, amount: 2, unit: 'ml'}]},
  12: {id: 12, name: 'C', last: '2018-09-03', ingredients: [{id: 101, amount: 4, unit: 'L'}]},
  17: {id: 17, name: 'D', last: '2018-08-01', ingredients: []},
  23: {id: 23, name: 'E', last: '2018-09-04', ingredients: []},
  25: {id: 25, name: 'F', last: '2018-09-05', ingredients: []},
  29: {id: 29, name: 'G', last: '2018-09-06', ingredients: []},
  43: {id: 43, name: 'H', last: '2018-08-02', ingredients: []},
  44: {id: 44, name: 'I', last: '2018-09-01', ingredients: []}
}

const models = {
  dish: {
    getAll() {
      return Object.values(allDishes)
    },
  },

  ingredient: {
    byId(id) {
      return allIngredients[id]
    }
  }
}

describe('DishProposer', () => {
  it('should return a data structure containing dishes and ingredients', () => {
    const proposer = DishProposer({models})
    const result = proposer.get()
    result.should.have.property('dishes')
    result.should.have.property('ingredients')
  })

  it('should propose the 7 dishes which are the longest not served', () => {
    const proposer = DishProposer({models})
    proposer.get().dishes.map(d => d.id).should.deepEqual([17, 43, 1, 44, 8, 12, 23])
  })

  it('should propose 7 dishes with some ids inhibited', () => {
    const proposer = DishProposer({models})
    proposer.get([12, 1, 33]).dishes.map(d => d.id).should.deepEqual([17, 43, 44, 8, 23, 25, 29])
  })

  it('should return no ingredients as long there are no accepted dishes', () => {
    const proposer = DishProposer({models})
    proposer.get().ingredients.length.should.equal(0)
  })

  it('should return ingredients only of accepted dishes', () => {
    const proposer = DishProposer({models})
    proposer.get([], [1]).ingredients.should.deepEqual([{id: 101, name: 'a', amount: 1, unit: 'L'}])
  })

  it('should add amounts of ingredients', () => {
    const proposer = DishProposer({models})
    proposer.get([], [1, 12]).ingredients.should.deepEqual([{id: 101, name: 'a', amount: 5, unit: 'L'}])
  })
})
