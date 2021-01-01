import 'should'
import DishProposer from './DishProposer.js'

const allIngredients = {
  101: {id: '101', name: 'a'},
  108: {id: '108', name: 'b'}
}

const allDishes = {
  1: {id: '1', name: 'A', last: '2018-09-01', ingredients: [{id: '101', amount: 1, unit: 'L'}]},
  8: {id: '8', name: 'B', last: '2018-09-02', ingredients: [{id: '108', amount: 2, unit: 'ml'}]},
  12: {id: '12', name: 'C', last: '2018-09-03', ingredients: [{id: '101', amount: 4, unit: 'L'}]},
  17: {id: '17', name: 'D', last: '2018-08-01', ingredients: []},
  23: {id: '23', name: 'E', last: '2018-09-04', ingredients: []},
  25: {id: '25', name: 'F', last: '2018-09-05', ingredients: []},
  29: {id: '29', name: 'G', last: '2018-09-06', ingredients: []},
  43: {id: '43', name: 'H', last: '2018-08-02', ingredients: []},
  44: {id: '44', name: 'I', last: '2018-09-01', ingredients: []}
}

const dishLists = {
  7: { users: [7], dishes: ['1', '8', '12', '17', '23', '25', '29', '43', '44']},
  24: { users: [24], dishes: ['8', '25']}
}

const models = {
  dish: {
    getAll: () => Object.values(allDishes),
    getDishById: (id) => allDishes[id]
  },
  ingredient: { byId: id => allIngredients[id] },
  dishList: { getDishes: listId => dishLists[listId].dishes },
}

const userA = { id: 7 }
const userB = { id: 24 }

describe('DishProposer', () => {
  it('should return a list of dish proposals', () => {
    const proposer = DishProposer({ models })
    const result = proposer.get(userA)
    result.should.be.an.Array()
  })

  it('should propose the 7 dishes which are the longest not served', () => {
    const proposer = DishProposer({ models })
    proposer.get(userA).map(d => d.id).should.deepEqual(['17', '43', '1', '44', '8', '12', '23'])
  })

  it('should propose 7 dishes with some ids inhibited', () => {
    const proposer = DishProposer({models})
    proposer.get(userA, ['12', '1', '33']).map(d => d.id).should.deepEqual(['17', '43', '44', '8', '23', '25', '29'])
  })

  it('should propose only dishes from own list', () => {
    const proposer = DishProposer({ models })
    proposer.get(userB).map(d => d.id).should.deepEqual(['8', '25'])
  })
})
