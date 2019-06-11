import React from 'react';
import {shallow} from "enzyme";
import {List} from '@material-ui/core';

import LinkedDataEntityForm from "../LinkedDataEntityForm";
import Config from "../../../../services/Config/Config";
import {STRING_URI} from "../../../../constants";
import MessageDisplay from "../../../common/MessageDisplay";

describe('LinkedDataEntityForm', () => {
    const defaultMetadata = [{
        key: "@type",
        label: "",
        values: [
            {
                id: "http://fairspace.io/ontology#BiologicalSample",
                label: "Biological Sample"
            }
        ],
        maxValuesCount: 1,
        machineOnly: false,
        multiLine: false
    }, {
        key: 'my-property',
        label: "",
        values: [],
        datatype: STRING_URI,
        maxValuesCount: 1,
        machineOnly: false,
        multiLine: false
    }];

    beforeAll(() => {
        window.fetch = jest.fn(() => Promise.resolve({ok: true, json: () => ({})}));

        Config.setConfig({
            urls: {
                metadata: "/metadata"
            }
        });

        return Config.init();
    });

    it('render properties', () => {
        const metadata = [
            {
                key: "http://fairspace.io/ontology#createdBy",
                label: "Creator",
                values: [
                    {
                        id: "http://fairspace.io/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd",
                        label: "John"
                    }
                ],
                range: "http://fairspace.io/ontology#User",
                maxValuesCount: 0,
                machineOnly: true,
                multiLine: false
            }
        ];
        const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
        const wrapper = shallow(<LinkedDataEntityForm
            properties={metadata}
            subject={subject}
        />);
        expect(wrapper.find(List).children().length).toBe(1);
    });

    it('shows result when subject provided and data is loaded', () => {
        const collection = {
            iri: "http://fairspace.com/iri/collections/1"
        };

        const wrapper = shallow(<LinkedDataEntityForm
            properties={defaultMetadata}
            subject={collection.iri}
        />);

        expect(wrapper.find(List).length).toEqual(1);
    });

    it('shows an error message if no data is available', () => {
        const collection = {
            iri: "http://fairspace.com/iri/collections/1"
        };

        const wrapper = shallow(<LinkedDataEntityForm
            properties={defaultMetadata}
            subject={collection.iri}
            error="Testing error"
        />);

        const errorMessage = wrapper.find(MessageDisplay);
        expect(errorMessage.length).toEqual(1);
    });
});
