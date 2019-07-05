import React from 'react';
import {mount} from 'enzyme';
import CollectionDetails, {ICONS} from "../CollectionDetails";
import Config from "../../../services/Config/Config";
import configFile from "../../../config";

beforeAll(() => {
    Config.setConfig(Object.assign(configFile, {
        externalConfigurationFiles: [],
    }));
    return Config.init();
});

describe('<CollectionDetails />', () => {
    it('renders proper icon for local storage collection', () => {
        const dateCreated = new Date().toUTCString();
        const collection = {type: 'LOCAL_STORAGE', name: 'Test1', iri: 'http://test', dateCreated};
        const wrapper = mount(<CollectionDetails collection={collection} />);

        expect(wrapper.contains(ICONS.LOCAL_STORAGE)).toBeTruthy();
    });
});
