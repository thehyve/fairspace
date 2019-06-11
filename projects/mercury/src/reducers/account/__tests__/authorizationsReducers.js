import reducer from '../authorizationsReducers';
import {testNoChangedOnUnknownActionType} from '../../../utils/testUtils';

testNoChangedOnUnknownActionType('Authorization reducers', reducer);
