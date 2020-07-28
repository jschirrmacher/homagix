/*global global*/
import React from 'react'
import {Provider} from 'react-redux'
import renderer from 'react-test-renderer'
import IngredientsList from './IngredientsList'
import should from 'should'

import configureStore from 'redux-mock-store'

const middlewares = []
const mockStore = configureStore(middlewares)

const initialState = {
  error: {},
  proposals: {data: []}
}

const store = mockStore(initialState)

const ingredients = [{id: 4, amount: 5, unit: 'L', name: 'Milch'}]

global.setTimeout = callback => callback()

describe('IngredientsList', () => {
  it('renders without crashing', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList /></Provider>)
    expect(tree).toMatchSnapshot()
  })

  it('should render ingredients', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList showAmount="true" ingredients={ingredients}/></Provider>)
    const li = tree.toJSON().children[0]
    li.children[2].children[0].should.containEql(5)
    li.children[3].children[0].should.containEql('L')
    li.children[4].should.containEql('Milch')
  })

  it('should render an empty list when no ingredients are selected', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={[]}/></Provider>)
    const div = tree.toJSON()
    div.type.should.equal('ul')
    should(div.children).be.null()
  })

  it('has a button to remove proposed ingredients', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={ingredients}/></Provider>)
    const li = tree.toJSON().children[0]
    li.children[0].type.should.equal('button')
    const button = li.children[0]
    button.props.className.should.containEql('delete')
    button.children[0].should.equal('×')
  })

  it('should mark items when the delete button is clicked', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={ingredients}/></Provider>)
    const li = tree.toJSON().children[0]
    const button = li.children[0]
    button.props.onClick({target: {parentNode: document.createElement('li')}})
    tree.toJSON().children[0].props.className.should.equal('inhibited')
  })

  it('should remove the mark when the button is clicked again', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={ingredients}/></Provider>)
    const li = tree.toJSON().children[0]
    const button = li.children[0]
    const event = {target: {parentNode: document.createElement('li')}}
    button.props.onClick(event)
    button.props.onClick(event)
    should(tree.toJSON().children[0].props.className).equal('')
  })

  it('should render an input field to add ingredients', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList showNew="true" ingredients={ingredients}/></Provider>)
    const item = tree.toJSON().children[1]
    item.props.id.should.equal('additionalItem')
    item.children[0].type.should.equal('input')
  })

  function enterTotarget(target, value) {
    target.value = value
    target.onKeyDown({keyCode: 65, target})
    target.onKeyDown({keyCode: 8, target})
    target.onKeyDown({keyCode: 13, target})
  }

  it('should add ingredients when enter is pressed', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList showAmount="true" showNew="true" ingredients={ingredients}/></Provider>)
    const input = tree.toJSON().children[1].children[0]
    enterTotarget(input.props, '2 Stk Butter')
    const entries = tree.toJSON().children[0]
    entries.children[2].children[0].should.containEql(2)
    entries.children[3].children[0].should.containEql('Stk')
    entries.children[4].should.containEql('Butter')
  })

  it('should remove additional ingredients when delete button is pressed', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList showNew="true" ingredients={ingredients}/></Provider>)
    const input = tree.toJSON().children[1].children[0]
    enterTotarget(input.props, '2 Stk Butter')
    const button = tree.toJSON().children[0].children[0]
    button.props.onClick({target: {parentNode: document.createElement('li')}})
    tree.toJSON().children[1].props.id.should.equal('additionalItem')
  })
})
