import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow'
import {Provider} from 'react-redux'
import App from './App'

import configureStore from 'redux-mock-store'

const middlewares = []
const mockStore = configureStore(middlewares)

const initialState = {
  error: {},
  proposals: {data: []}
}

const store = mockStore(initialState)

it('renders without crashing', () => {
  const renderer = new ShallowRenderer()
  renderer.render(<Provider store={store}><App /></Provider>)
  const tree = renderer.getRenderOutput()
  expect(tree).toMatchSnapshot()
})
