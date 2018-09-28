import { combineReducers } from 'redux'
import user from './user'
import authorizations from './authorizations'

export default combineReducers({
    user,
    authorizations
})
