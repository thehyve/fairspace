import { combineReducers } from 'redux'
import account from './account'
import cache from './cache'

export default combineReducers({
    account,
    cache
})
