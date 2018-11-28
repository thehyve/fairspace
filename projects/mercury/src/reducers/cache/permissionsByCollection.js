import {promiseReducerFactory} from "../../utils/redux";
import reduceReducers from 'reduce-reducers';
import {PERMISSIONS} from "../../actions/actionTypes";

const defaultState = {};

const permissionByCollectionReducer = promiseReducerFactory(PERMISSIONS, defaultState, action => action.meta.collectionId);

const updatePermissionsReducer = (state = defaultState, action) => {
    switch(action.type) {
        default:
            return state
    }
}

export default reduceReducers(permissionByCollectionReducer, updatePermissionsReducer, defaultState);
