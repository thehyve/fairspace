/* eslint-disable import/no-extraneous-dependencies */
import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Config from "./common/services/Config";

configure({adapter: new Adapter()});

beforeAll(() => Config.init());
