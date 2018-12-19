import reduceReducers from 'reduce-reducers';
import {promiseReducerFactory} from "../../utils/redux";
import {ALTER_PERMISSION, PERMISSIONS} from "../../actions/actionTypes";
import * as actionTypes from "../../utils/redux-action-types";

const defaultState = {};
const permissionByCollectionReducer = promiseReducerFactory(PERMISSIONS, defaultState, action => action.meta.collectionId);

// Functions to modify the permission cache after altering the permissions
const removeCollaborator = (collaborators, actionMeta) => (collaborators ? collaborators.filter(collaborator => collaborator.subject !== actionMeta.subject) : []);

const updateCollaborator = (collaborators, actionMeta) => removeCollaborator(collaborators, actionMeta).concat(actionMeta);

const updatePermissions = (state, actionMeta) => ({
    ...state,
    data: actionMeta.access === 'None'
        ? removeCollaborator(state ? state.data : [], actionMeta)
        : updateCollaborator(state ? state.data : [], actionMeta),
    invalidated: true
});

const updatePermissionsReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.fulfilled(ALTER_PERMISSION):
            return {
                ...state,
                [action.meta.collectionId]:
                    updatePermissions(state[action.meta.collectionId], action.meta)
            };
        default:
            return state;
    }
};

export default reduceReducers(permissionByCollectionReducer, updatePermissionsReducer, defaultState);
