import {combineReducers} from 'redux'
import proposals from './proposalsReducer'
import error from './errorReducer'

const rootReducer = combineReducers({error, proposals})

export default rootReducer
