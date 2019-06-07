import React from 'react';
import {shallow} from "enzyme";
import {List, ListItem} from '@material-ui/core';

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import Config from "../../../services/Config/Config";
import {STRING_URI} from "../../../constants";
import MessageDisplay from "../../common/MessageDisplay";
import LinkedDataProperty from "./LinkedDataProperty";

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

    describe('field order', () => {
        it('should sort by property order first', () => {
            const metadata = [
                {
                    key: "http://fairspace.io/ontology#AAA",
                    label: "AAA",
                    order: 100,
                    values: [
                        {
                            id: "http://fairspace.io/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd",
                            label: "John"
                        }
                    ],
                },
                {
                    key: "http://fairspace.io/ontology#BBB",
                    label: "BBB",
                    order: 90
                }

            ];
            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm
                properties={metadata}
                subject={subject}
            />);

            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.at(0).prop('property').key).toEqual("http://fairspace.io/ontology#BBB");
            expect(renderedProperties.at(1).prop('property').key).toEqual("http://fairspace.io/ontology#AAA");
        });

        it('should move properties without order to the end', () => {
            const metadata = [
                {
                    key: "http://fairspace.io/ontology#AAA",
                    label: "AAA",
                    values: [
                        {
                            id: "http://fairspace.io/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd",
                            label: "John"
                        }
                    ],
                },
                {
                    key: "http://fairspace.io/ontology#BBB",
                    label: "BBB",
                    order: 90
                }

            ];
            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm
                properties={metadata}
                subject={subject}
            />);

            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.at(0).prop('property').key).toEqual("http://fairspace.io/ontology#BBB");
            expect(renderedProperties.at(1).prop('property').key).toEqual("http://fairspace.io/ontology#AAA");
        });

        it('should sort by values if no order is specified', () => {
            const metadata = [
                {
                    key: "http://fairspace.io/ontology#AAA",
                    label: "AAA",
                },
                {
                    key: "http://fairspace.io/ontology#BBB",
                    label: "BBB",
                    values: [
                        {
                            id: "http://fairspace.io/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd",
                            label: "John"
                        }
                    ]
                }
            ];
            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm
                properties={metadata}
                subject={subject}
            />);

            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.at(0).prop('property').key).toEqual("http://fairspace.io/ontology#BBB");
            expect(renderedProperties.at(1).prop('property').key).toEqual("http://fairspace.io/ontology#AAA");
        });

        it('should treat empty values as non existent', () => {
            const metadata = [
                {
                    key: "http://fairspace.io/ontology#AAA",
                    label: "AAA",
                    values: [
                        {value: ""}
                    ]
                },
                {
                    key: "http://fairspace.io/ontology#BBB",
                    label: "BBB",
                    values: [
                        {
                            id: "http://fairspace.io/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd",
                            label: "John"
                        }
                    ]
                }
            ];
            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm
                properties={metadata}
                subject={subject}
            />);

            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.at(0).prop('property').key).toEqual("http://fairspace.io/ontology#BBB");
            expect(renderedProperties.at(1).prop('property').key).toEqual("http://fairspace.io/ontology#AAA");
        });


        it('should sort by label if no order is specified and both fields are empty', () => {
            const metadata = [
                {
                    key: "http://fairspace.io/ontology#AAA",
                    label: "Second",
                },
                {
                    key: "http://fairspace.io/ontology#BBB",
                    label: "First",
                }

            ];
            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm
                properties={metadata}
                subject={subject}
            />);

            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.at(0).prop('property').key).toEqual("http://fairspace.io/ontology#BBB");
            expect(renderedProperties.at(1).prop('property').key).toEqual("http://fairspace.io/ontology#AAA");
        });
    });
});
