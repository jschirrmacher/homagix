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
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={ingredients}/></Provider>)
    const li = tree.toJSON().children[0]
    const content = li.children.splice(1).join('')
    content.should.containEql('5 L Milch')
  })

  it('should render an information message when no ingredients are selected', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={[]}/></Provider>)
    const div = tree.toJSON()
    div.type.should.equal('div')
    div.props.className.should.equal('info')
    div.children[0].should.be.instanceOf(String)
  })

  it('has a button to remove proposed ingredients', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={ingredients}/></Provider>)
    const li = tree.toJSON().children[0]
    li.children[0].type.should.equal('button')
    const button = li.children[0]
    button.props.className.should.equal('delete')
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

  it('has an input field to add ingredients', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={ingredients}/></Provider>)
    const input = tree.toJSON().children[1].children[0]
    input.type.should.equal('input')
    input.props.id.should.equal('additionalItem')
  })

  it('should add ingredients when enter is pressed', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={ingredients}/></Provider>)
    const input = tree.toJSON().children[1].children[0]
    input.props.value = '2 Stk. Butter'
    input.props.onKeyDown({keyCode: 13, target: input.props})
    const li = tree.toJSON().children[1]
    const content = li.children.splice(1).join('').trim()
    content.should.containEql('2 Stk. Butter')
  })

  it('should remove additional ingredients when delete button is pressed', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList ingredients={ingredients}/></Provider>)
    const input = tree.toJSON().children[1].children[0]
    input.props.value = '2 Stk. Butter'
    input.props.onKeyDown({keyCode: 13, target: input.props})
    const button = tree.toJSON().children[1].children[0]
    button.props.onClick({target: {parentNode: document.createElement('li')}})
    tree.toJSON().children[1].children[0].props.id.should.equal('additionalItem')
  })
})
