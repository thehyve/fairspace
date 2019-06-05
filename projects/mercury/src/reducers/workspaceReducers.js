import {promiseReducerFactory} from "../utils/redux";
import {FETCH_WORKSPACE} from "../actions/actionTypes";

const defaultState = {};

export default promiseReducerFactory(FETCH_WORKSPACE, defaultState);

export const getWorkspace = ({workspace}) => workspace.data;
export const isWorkspacePending = ({workspace}) => !!workspace.pending;
export const hasWorkspaceError = ({workspace}) => !!workspace.error;
