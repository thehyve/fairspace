import reducer from '../workspaceReducers';
import {testNoChangedOnUnknownActionType} from '../../utils/testUtils';

testNoChangedOnUnknownActionType('Workspace reducers', reducer);
