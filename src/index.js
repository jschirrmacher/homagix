import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import logo from './homagix.png'
import App from './components/App';
import * as serviceWorker from './serviceWorker';

import {BrowserRouter, Switch, Route} from 'react-router-dom'
import configureStore from './configureStore'
import {Provider} from 'react-redux'

const store = configureStore()

ReactDOM.render(
  <React.Fragment>
    <h1>
      <img src={logo} className="App-logo" alt="Homagix Logo" />
      Homagix
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
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
