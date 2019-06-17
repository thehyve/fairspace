import reducer from '../usersReducers';
import {testNoChangedOnUnknownActionType} from '../../../utils/testUtils';

testNoChangedOnUnknownActionType('Users reducers', reducer);
