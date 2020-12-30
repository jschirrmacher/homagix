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
  ['2020-12-27', 'd'],
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
      dishes.b,
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

  it('should keep past days without history entries empty', () => {
    controller.getWeekplan('2020-12-20', [], new Date('2020-12-24T10:00:00'))
      .map(e => ({ date: e.date, id: e.dish && e.dish.id }))
      .should.deepEqual([
        { date: '2020-12-20', id: 'b' },
        { date: '2020-12-21', id: 'a' },
        { date: '2020-12-22', id: undefined },
        { date: '2020-12-23', id: undefined },
        { date: '2020-12-24', id: 'd' },
        { date: '2020-12-25', id: 'c' },
        { date: '2020-12-26', id: 'b' }
      ])
  })

  it('should include all requested dates', () => {
    controller.getWeekplan('2020-12-22', [], new Date('2020-12-30T10:00:00'))
      .map(e => e.date)
      .should.deepEqual(['2020-12-22', '2020-12-23', '2020-12-24', '2020-12-25', '2020-12-26', '2020-12-27', '2020-12-28' ])
  })
})
