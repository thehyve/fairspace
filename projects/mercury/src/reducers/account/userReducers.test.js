import reducer from './userReducers';
import {testNoChangedOnUnknownActionType} from '../../utils/testUtils';

testNoChangedOnUnknownActionType('User reducers', reducer);
