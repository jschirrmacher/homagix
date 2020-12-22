import 'should'
import WeekplanController from './WeekplanController.js'

const dishes = {
  a: { id: 'a' },
  b: { id: 'b' },
  c: { id: 'c' },
  d: { id: 'd' },
}
const history = [
  ['2020-12-14', 'd'],
  ['2020-12-15', 'a'],
  ['2020-12-16', 'b'],
  ['2020-12-18', 'c'],
  ['2020-12-17', 'd'],
  ['2020-12-19', 'c'],
  ['2020-12-21', 'a'],
  ['2020-12-20', 'b'],
]

const models = {
  dishHistory: {
    getFrom: (date) => history.filter(([d]) => d >= date)
  },
  dish: {
    byId: (id) => dishes[id]
  }
}

const proposer = {
  get() {
    return [
      dishes.d,
      dishes.c,
    ]
  }
}

const controller = WeekplanController({ models, proposer })

describe('WeekplanController.getWeekplan', () => {
  it('should return a list of dishes and dates', () => {
    controller.getWeekplan('2020-12-20', []).should.be.an.Array()
  })

  it('should return only dates from the given start date on', () => {
    controller.getWeekplan('2020-12-20', []).some(e => e.date < '2020-12-20').should.be.false()
  })

  it('should sort dishes by date', () => {
    controller.getWeekplan('2020-12-20', []).map(e => e.date).should.deepEqual(['2020-12-20', '2020-12-21', '2020-12-22', '2020-12-23', '2020-12-24', '2020-12-25', '2020-12-26'])
  })

  it('should contain already served dishes', () => {
    controller.getWeekplan('2020-12-20', []).some(e => e.served).should.be.true()
  })

  it('should contain proposals', () => {
    controller.getWeekplan('2020-12-20', []).some(e => !e.served).should.be.true()
  })

  it('should not return more than 7 entries', () => {
    controller.getWeekplan('2020-12-14', []).length.should.be.lessThanOrEqual(7)
  })
})
