/* eslint-disable import/no-extraneous-dependencies */
import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Config from "./common/services/Config";
import configFile from "./config";

configure({adapter: new Adapter()});

beforeAll(() => {
    Config.setConfig(Object.assign(configFile, {
        externalConfigurationFiles: [],
    }));

    return Config.init();
});
