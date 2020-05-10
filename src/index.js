import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import logo from './homagix.png'
import App from './components/App'
import '@babel/polyfill'

import {BrowserRouter, Switch, Route} from 'react-router-dom'
import configureStore from './configureStore'
import {Provider} from 'react-redux'

const store = configureStore()

ReactDOM.render(
  <React.Fragment>
    <h1>
      <img src={logo} className="App-logo" alt="Homagix Logo" />
      omagix
    </h1>

    <Provider store={store}>
      <BrowserRouter>
        <Switch className="App">
          <Route exact path="/" component={App}/>
        </Switch>
      </BrowserRouter>
    </Provider>
  </React.Fragment>,
  document.getElementById('root')
)

if (location.hostname === 'localhost') {
  module.hot.accept();
}
