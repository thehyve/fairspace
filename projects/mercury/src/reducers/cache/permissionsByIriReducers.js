import reduceReducers from 'reduce-reducers';
import {promiseReducerFactory} from "../../utils/redux";
import * as actionTypes from "../../actions/actionTypes";

const defaultState = {};
const permissionByCollectionReducer = promiseReducerFactory(
    actionTypes.FETCH_PERMISSIONS, defaultState, action => action.meta.iri
);

// Functions to modify the permission cache after altering the permissions
const removeCollaborator = (collaborators, actionMeta) => (collaborators ? collaborators.filter(collaborator => collaborator.user !== actionMeta.user) : []);

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
        case actionTypes.ALTER_PERMISSION_FULFILLED:
            return {
                ...state,
                [action.meta.iri]:
                    updatePermissions(state[action.meta.iri], action.meta)
            };
        default:
            return state;
    }
};

export default reduceReducers(permissionByCollectionReducer, updatePermissionsReducer, defaultState);
