import { combineReducers } from 'redux'

import user from './user'
import lang from './lang'

export default combineReducers({
  user,
  lang
})
