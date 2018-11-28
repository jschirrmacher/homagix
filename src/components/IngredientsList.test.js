import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow'
import renderer from 'react-test-renderer'
import {Provider} from 'react-redux'
import IngredientsList from './IngredientsList'
import 'should'

import configureStore from 'redux-mock-store'

const middlewares = []
const mockStore = configureStore(middlewares)

const initialState = {
  error: {},
  proposals: {ingredients: [{id: 4, amount: 5, unit: 'L', name: 'Milch'}]}
}

const store = mockStore(initialState)

describe('IngredientsList', () => {
  it('renders without crashing', () => {
    const renderer = new ShallowRenderer()
    renderer.render(<Provider store={store}><IngredientsList/></Provider>)
    const tree = renderer.getRenderOutput()
    expect(tree).toMatchSnapshot()
  })

  it('should render ingredients', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList/></Provider>)
    const li = tree.toJSON().children[0]
    const content = li.children.splice(1).join('')
    content.should.equal('5 L Milch')
  })

  it('has a button to remove proposed ingredients', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList/></Provider>)
    const li = tree.toJSON().children[0]
    li.children[0].type.should.equal('button')
    const button = li.children[0]
    button.props.className.should.equal('delete')
    button.children[0].should.equal('×')
  })

  it('should mark items when the delete button is clicked', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList/></Provider>)
    const li = tree.toJSON().children[0]
    const button = li.children[0]
    button.props.onClick()
    tree.toJSON().children[0].props.className.should.equal('inhibited')
  })

  it('should remove the mark when the button is clicked again', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList/></Provider>)
    const li = tree.toJSON().children[0]
    const button = li.children[0]
    button.props.onClick()
    button.props.onClick()
    should(tree.toJSON().children[0].props.className).be.undefined()
  })

  it('has an input field to add ingredients', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList/></Provider>)
    const input = tree.toJSON().children[1].children[0]
    input.type.should.equal('input')
    input.props.id.should.equal('additionalItem')
  })

  it('should add ingredients when enter is pressed', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList/></Provider>)
    const input = tree.toJSON().children[1].children[0]
    input.props.value = '2 Stk. Butter'
    input.props.onKeyDown({keyCode: 13, target: input.props})
    const li = tree.toJSON().children[1]
    const content = li.children.splice(1).join('').trim()
    content.should.equal('2 Stk. Butter')
  })

  it('should remove additional ingredients when delete button is pressed', () => {
    const tree = renderer.create(<Provider store={store}><IngredientsList/></Provider>)
    const input = tree.toJSON().children[1].children[0]
    input.props.value = '2 Stk. Butter'
    input.props.onKeyDown({keyCode: 13, target: input.props})
    const button = tree.toJSON().children[1].children[0]
    button.props.onClick()
    tree.toJSON().children[1].children[0].props.id.should.equal('additionalItem')
  })
})
