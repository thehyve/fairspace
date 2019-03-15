import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from "@material-ui/core/IconButton";
import {createShallow, createMount} from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";
import ValueComponentFactory from "./values/ValueComponentFactory";
import {STRING_URI} from "../../constants";
import Config from "../../services/Config/Config";
import MetadataProperty from "./MetadataProperty";

const middlewares = [thunk, promiseMiddleware];
const mockStore = configureStore(middlewares);

const subject = 'https://thehyve.nl';
const defaultProperty = {
    key: 'description',
    range: STRING_URI,
    label: 'Description',
    values: [{value: 'More info'}, {value: 'My first collection'}, {value: 'My second collection'}],
    allowMultiple: true
};
const shallow = createShallow({dive: true});
const mount = createMount();

beforeEach(() => {
    window.fetch = jest.fn(() => Promise.resolve({ok: true}));
    Config.setConfig({
        urls: {
            metadata: "/metadata"
        }
    });

    return Config.init();
});

describe('MetadataProperty elements', () => {
    it('shows all provided values', () => {
        const property = {
            ...defaultProperty,
            allowMultiple: false
        };

        const store = mockStore({});
        const wrapper = shallow(<MetadataProperty editable store={store} property={property} subject={subject} />);
        const listItems = wrapper.dive().find(List).find(ListItem);
        expect(listItems.length).toEqual(3);
    });

    it('shows an add element if multiple values are allowed, and it is editable', () => {
        const store = mockStore({});
        const wrapper = shallow(<MetadataProperty editable store={store} property={defaultProperty} subject={subject} />);

        const listItems = wrapper.dive().find(List).find(ListItem);
        expect(listItems.length).toEqual(4);
        const deletIcons = wrapper.dive().find(List).find(ClearIcon);
        expect(deletIcons.length).toEqual(3);
    });

    it('shows no add element if multiple values are allowed, but it is uneditable', () => {
        const store = mockStore({});
        const wrapper = shallow(<MetadataProperty editable={false} store={store} property={defaultProperty} subject={subject} />);

        const listItems = wrapper.dive().find(List).find(ListItem);
        expect(listItems.length).toEqual(3);
        const deletIcons = wrapper.dive().find(List).find(ClearIcon);
        expect(deletIcons.length).toEqual(0);
    });

    it('shows an add element if there is no value yet, and it is editable', () => {
        const property = {
            ...defaultProperty,
            values: []
        };

        const store = mockStore({});
        const wrapper = shallow(<MetadataProperty editable store={store} property={property} subject={subject} />);

        const listItems = wrapper.dive().find(List).find(ListItem);
        expect(listItems.length).toEqual(1);

        // Assert contents of the single component
        const ExpectedComponent = ValueComponentFactory.addComponent(property);
        const inputComponent = listItems.at(0).dive().find(ExpectedComponent);
        expect(inputComponent.prop('entry')).toEqual({value: ""});
    });

    it('shows no add element if there is no value yet, but it is uneditable', () => {
        const property = {
            ...defaultProperty,
            values: []
        };

        const store = mockStore({});
        const wrapper = shallow(<MetadataProperty editable={false} store={store} property={property} subject={subject} />);

        const listItems = wrapper.dive().find(List).find(ListItem);
        expect(listItems.length).toEqual(0);
    });

    it('does not show an add element if one value has been provided already, and it is editable', () => {
        const property = {
            ...defaultProperty,
            values: [{value: 'More info'}],
            allowMultiple: false
        };

        const store = mockStore({});
        const wrapper = shallow(<MetadataProperty editable store={store} property={property} subject={subject} />);

        const listItems = wrapper.dive().find(List).find(ListItem);
        expect(listItems.length).toEqual(1);

        // Assert contents of the single component
        const ExpectedComponent = ValueComponentFactory.editComponent(property);
        const inputComponent = listItems.at(0).dive().find(ExpectedComponent);
        expect(inputComponent.prop('entry').value).toEqual('More info');
    });

    it('does not show an add element if multiples values are provided, but it is not editable', () => {
        const property = {
            ...defaultProperty,
            values: [{value: 'More info'}, {value: 'another info'}],
            allowMultiple: true
        };
        const store = mockStore({});
        const wrapper = shallow(<MetadataProperty editable={false} store={store} property={property} subject={subject} />);
        const listItems = wrapper.dive().find(List).find(ListItem);
        expect(listItems.length).toEqual(2);
    });
});

describe('MetadataProperty changes', () => {
    it('handles addition correctly', () => {
        const store = mockStore({});
        const wrapper = mount(<MetadataProperty editable store={store} property={defaultProperty} subject={subject} />);
        const input = wrapper.find('input').last();
        input.simulate('focus');
        input.simulate('change', {target: {value: 'New more info'}});
        input.simulate('blur');

        wrapper.unmount();
        const actions = store.getActions();
        expect(actions.length).toEqual(1);
        expect(actions[0].meta.subject).toEqual('https://thehyve.nl');
        expect(actions[0].meta.values.length).toEqual(4);
        expect(actions[0].meta.values.slice(0, 3)).toEqual(defaultProperty.values);
        expect(actions[0].meta.values[3].value).toEqual('New more info');
    });


    it('handles updates correctly', () => {
        const store = mockStore({});

        const wrapper = mount(<MetadataProperty editable store={store} property={defaultProperty} subject={subject} />);

        const input = wrapper.find('input').first();
        input.simulate('focus');
        input.simulate('change', {target: {value: 'New more info'}});
        input.simulate('blur');

        wrapper.unmount();

        const actions = store.getActions();
        expect(actions.length).toEqual(1);
        expect(actions[0].meta.subject).toEqual('https://thehyve.nl');
        expect(actions[0].meta.values.length).toEqual(3);
        expect(actions[0].meta.values[0].value).toEqual('New more info');
        expect(actions[0].meta.values[1].value).toEqual('My first collection');
        expect(actions[0].meta.values[2].value).toEqual('My second collection');
    });

    it('does not actually update when input does not change', () => {
        const store = mockStore({});
        const wrapper = mount(<MetadataProperty editable store={store} property={defaultProperty} subject={subject} />);

        const input = wrapper.find('input').first();
        input.simulate('focus');
        input.simulate('change', {target: {value: 'More info'}});
        input.simulate('blur');

        wrapper.unmount();

        const actions = store.getActions();
        expect(actions.length).toEqual(0);
    });

    it('handles deletion correctly', () => {
        const store = mockStore({});

        const wrapper = mount(<MetadataProperty editable store={store} property={defaultProperty} subject={subject} />);

        const secondButton = wrapper.find(IconButton).at(1);
        secondButton.simulate('click');

        wrapper.unmount();

        const actions = store.getActions();
        expect(actions.length).toEqual(1);
        expect(actions[0].meta.subject).toEqual('https://thehyve.nl');
        expect(actions[0].meta.values.length).toEqual(2);
        expect(actions[0].meta.values[0].value).toEqual('More info');
        expect(actions[0].meta.values[1].value).toEqual('My second collection');
    });
});
