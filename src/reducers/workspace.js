import {WORKSPACE} from "../actions/actionTypes";
import {promiseReducerFactory} from "../utils/redux";

const defaultState = {
    name: '',
    version: ''
};

const workspace = (state = defaultState, action) => {
    switch (action.type) {
        case 'WORKSPACE_FULFILLED':
            return {
                ...state,
                name: action.payload.name,
                version: action.payload.version
            };
        default:
            return state;
    }
}

// export default promiseReducerFactory(WORKSPACE, defaultState);


export default workspace;
