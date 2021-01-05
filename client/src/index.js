import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import * as serviceWorker from './serviceWorker'
import reducers from './store/reducers'
import App from './App'

global.API_URL = /*process.env.NODE_ENV === 'development' ? */ 'http://localhost:5000' /* : 'https://api.hypertu.be'*/
global.BASE_URL = /*process.env.NODE_ENV === 'development' ? */ 'http://localhost:3000' /* : 'https://hypertu.be'*/

if (process.env.NODE_ENV !== 'development') {
  console.log = console.warn = console.error = () => {}
}

const store = createStore(reducers)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

serviceWorker.unregister()
