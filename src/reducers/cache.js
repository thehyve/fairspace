import {combineReducers} from 'redux'
import metadataBySubject from './metadataBySubject'
import vocabulary from "./vocabulary";

export default combineReducers({
    metadataBySubject,
    vocabulary
})
