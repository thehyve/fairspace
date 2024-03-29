import React from 'react';
import {configure, shallow} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

import {List} from '@mui/material';
import MessageDisplay from '../../../common/components/MessageDisplay';

import LinkedDataEntityForm from '../LinkedDataEntityForm';
import {STRING_URI} from '../../../constants';
import LinkedDataProperty from '../LinkedDataProperty';

// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({adapter: new Adapter()});

describe('LinkedDataEntityForm', () => {
    const defaultMetadata = [
        {
            key: '@type',
            label: '',
            maxValuesCount: 1,
            machineOnly: false,
            multiLine: false
        },
        {
            key: 'my-property',
            label: '',
            datatype: STRING_URI,
            maxValuesCount: 1,
            machineOnly: false,
            multiLine: false
        }
    ];

    const defaultValues = {
        '@type': [
            {
                id: 'https://fairspace.nl/ontology#BiologicalSample',
                label: 'Biological Sample'
            }
        ],
        'my-property': []
    };

    it('render properties', () => {
        const metadata = [
            {
                key: 'https://fairspace.nl/ontology#createdBy',
                label: 'Creator',
                range: 'https://fairspace.nl/ontology#User',
                maxValuesCount: 0,
                machineOnly: true,
                multiLine: false
            }
        ];

        const values = {
            'https://fairspace.nl/ontology#createdBy': [
                {
                    id: 'https://fairspace.nl/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd',
                    label: 'John'
                }
            ]
        };

        const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
        const wrapper = shallow(<LinkedDataEntityForm properties={metadata} values={values} subject={subject} />);
        expect(wrapper.find(List).children().length).toBe(1);
    });

    it('shows result when subject provided and data is loaded', () => {
        const collection = {
            iri: 'http://fairspace.com/iri/collections/1'
        };

        const wrapper = shallow(
            <LinkedDataEntityForm properties={defaultMetadata} values={defaultValues} subject={collection.iri} />
        );

        expect(wrapper.find(List).length).toEqual(1);
    });

    it('shows an error message if no data is available', () => {
        const collection = {
            iri: 'http://fairspace.com/iri/collections/1'
        };

        const wrapper = shallow(
            <LinkedDataEntityForm
                properties={defaultMetadata}
                values={defaultValues}
                subject={collection.iri}
                errorMessage="Testing error"
            />
        );

        const errorMessage = wrapper.find(MessageDisplay);
        expect(errorMessage.length).toEqual(1);
    });

    describe('field order', () => {
        it('should sort by property order first', () => {
            const metadata = [
                {
                    key: 'https://fairspace.nl/ontology#AAA',
                    label: 'AAA',
                    order: 100,
                    isEditable: true
                },
                {
                    key: 'https://fairspace.nl/ontology#BBB',
                    label: 'BBB',
                    order: 90,
                    isEditable: true
                }
            ];

            const values = {
                'https://fairspace.nl/ontology#AAA': [
                    {
                        id: 'https://fairspace.nl/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd',
                        label: 'John'
                    }
                ]
            };
            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm properties={metadata} values={values} subject={subject} />);

            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.at(0).prop('property').key).toEqual('https://fairspace.nl/ontology#BBB');
            expect(renderedProperties.at(1).prop('property').key).toEqual('https://fairspace.nl/ontology#AAA');
        });

        it('should move properties without order to the end', () => {
            const metadata = [
                {
                    key: 'https://fairspace.nl/ontology#AAA',
                    label: 'AAA',
                    isEditable: true
                },
                {
                    key: 'https://fairspace.nl/ontology#BBB',
                    label: 'BBB',
                    order: 90,
                    isEditable: true
                }
            ];

            const values = {
                'https://fairspace.nl/ontology#AAA': [
                    {
                        id: 'https://fairspace.nl/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd',
                        label: 'John'
                    }
                ]
            };
            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm properties={metadata} values={values} subject={subject} />);

            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.at(0).prop('property').key).toEqual('https://fairspace.nl/ontology#BBB');
            expect(renderedProperties.at(1).prop('property').key).toEqual('https://fairspace.nl/ontology#AAA');
        });

        it('should sort by label if no order is specified', () => {
            const metadata = [
                {
                    key: 'https://fairspace.nl/ontology#AAA',
                    label: 'Second',
                    isEditable: true
                },
                {
                    key: 'https://fairspace.nl/ontology#BBB',
                    label: 'First',
                    isEditable: true
                }
            ];
            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm properties={metadata} subject={subject} />);

            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.at(0).prop('property').key).toEqual('https://fairspace.nl/ontology#BBB');
            expect(renderedProperties.at(1).prop('property').key).toEqual('https://fairspace.nl/ontology#AAA');
        });
    });

    describe('field visibility', () => {
        it('should hide properties as indicated by shouldPropertyByHidden', () => {
            const metadata = [
                {
                    key: 'https://fairspace.nl/ontology#AAA',
                    label: 'AAA',
                    isEditable: true
                },
                {
                    key: '@type',
                    label: 'type',
                    isEditable: true
                },
                {
                    key: 'https://fairspace.nl/ontology#BBB',
                    label: 'BBB',
                    isEditable: true
                }
            ];

            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm properties={metadata} values={{}} subject={subject} />);

            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.length).toEqual(2);
            expect(renderedProperties.at(0).prop('property').key).toEqual('https://fairspace.nl/ontology#AAA');
            expect(renderedProperties.at(1).prop('property').key).toEqual('https://fairspace.nl/ontology#BBB');
        });

        it('should hide readonly properties without any data', () => {
            const metadata = [
                {
                    key: 'https://fairspace.nl/ontology#AAA',
                    label: 'AAA'
                },
                {
                    key: 'https://fairspace.nl/ontology#BBB',
                    label: 'BBB'
                },
                {
                    key: 'https://fairspace.nl/ontology#CCC',
                    label: 'CCC',
                    isEditable: true
                }
            ];

            const values = {
                'https://fairspace.nl/ontology#BBB': [{value: 'test'}]
            };

            const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
            const wrapper = shallow(<LinkedDataEntityForm properties={metadata} values={values} subject={subject} />);

            // We expect AAA to be hidden (not editable, no values)
            // We expect BBB to be shown (not editable, has values)
            // We expect CCC to be shown (is editable, no values)
            const renderedProperties = wrapper.find(LinkedDataProperty);
            expect(renderedProperties.length).toEqual(2);
            expect(renderedProperties.at(0).prop('property').key).toEqual('https://fairspace.nl/ontology#BBB');
            expect(renderedProperties.at(1).prop('property').key).toEqual('https://fairspace.nl/ontology#CCC');
        });
    });
});
