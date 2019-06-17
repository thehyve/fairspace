import reducer from '../vocabularyReducers';
import {testNoChangedOnUnknownActionType} from '../../../utils/testUtils';

testNoChangedOnUnknownActionType('vocabularyUtils reducers', reducer);
