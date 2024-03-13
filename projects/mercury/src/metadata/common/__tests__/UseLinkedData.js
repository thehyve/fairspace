import React from 'react';
import {render} from '@testing-library/react';
import {renderHook} from '@testing-library/react-hooks';
import {LinkedDataParent} from '../__wrapper__/LinkedDataParent';
import {
    COLLECTION_URI,
    COMMENT_URI,
    LABEL_URI,
    SHACL_PATH,
    SHACL_PROPERTY,
    SHACL_TARGET_CLASS
} from '../../../constants';
import {useLinkedDataNoContext} from '../UseLinkedData';

describe('useLinkedData', () => {
    const defaultJsonLd = [
        {
            '@id': 'http://subject',
            '@type': ['http://type'],
            'http://prop1': [{'@value': 'v'}]
        }
    ];

    const defaultContext = {
        fetchLinkedDataForSubject: () => Promise.resolve([]),
        result: {}
    };

    it('should fetch linked data when first loaded', () => {
        const context = {
            fetchLinkedDataForSubject: jest.fn(() => Promise.resolve([])),
            shapes: [{aShapeKey: 'aValue'}],
            result: {}
        };

        render(<LinkedDataParent iri={COLLECTION_URI} context={context} />);

        expect(context.fetchLinkedDataForSubject).toHaveBeenCalledTimes(1);
    });

    it('should handle missing linkedData', async () => {
        render(<LinkedDataParent iri="my-subject" context={defaultContext} />);

        expect(defaultContext.result.properties).toEqual([]);
        expect(defaultContext.result.values).toEqual({});
        expect(defaultContext.result.typeInfo).toEqual({});
    });

    describe('loading state', () => {
        it('should not be loading by default', async () => {
            render(<LinkedDataParent iri="my-subject" context={defaultContext} />);

            expect(defaultContext.result.linkedDataLoading).toBe(false);
        });

        it('should be loading if shapes are loading', async () => {
            const context = {
                ...defaultContext,
                shapesLoading: true,
                shapes: [{aShapeKey: 'aValue'}],
                fetchLinkedDataForSubject: jest.fn(() => Promise.resolve([]))
            };

            render(<LinkedDataParent iri="my-subject" context={context} />);

            expect(context.fetchLinkedDataForSubject).toHaveBeenCalled();
        });
    });

    describe('error state', () => {
        // skip for this moment, 'fetchLinkedDataForSubject' is triggered by useEffect after the result is returned.
        // react-hooks for react 18 is in progress, will soon be finished: https://www.npmjs.com/package/@testing-library/react-hooks
        it.skip('should show some message for no metadata', async () => {
            const context = {
                fetchLinkedDataForSubject: jest.fn(() => Promise.resolve([])),
                shapes: [],
                shapesLoading: false,
                result: {}
            };

            await render(<LinkedDataParent iri="my-subject" context={context} />);

            expect(context.result.linkedDataError).toMatch(/no metadata found/i);
        });

        it('should be in error state if shapes are in error state', async () => {
            const context = {
                ...defaultContext,
                shapesError: true,
                result: {}
            };

            render(<LinkedDataParent iri="my-subject" context={context} />);

            expect(context.result.linkedDataError).toBeTruthy();
        });
    });

    it.skip('should return properties based on the type of the entity', async () => {
        const context = {
            shapes: [
                {
                    [SHACL_TARGET_CLASS]: [{'@id': 'http://specific-type'}],
                    [SHACL_PROPERTY]: [{'@id': 'http://labelShape'}, {'@id': 'http://commentShape'}]
                },
                {
                    '@id': 'http://labelShape',
                    [SHACL_PATH]: [{'@id': LABEL_URI}]
                },
                {
                    '@id': 'http://commentShape',
                    [SHACL_PATH]: [{'@id': COMMENT_URI}]
                },
                {
                    '@id': 'http://otherShape',
                    [SHACL_PATH]: [{'@id': COLLECTION_URI}]
                }
            ],
            fetchLinkedDataForSubject: () =>
                Promise.resolve([
                    {
                        ...defaultJsonLd[0],
                        '@type': ['http://specific-type']
                    }
                ]),
            result: {}
        };

        render(<LinkedDataParent iri="http://subject" context={context} />);

        // await waitForNextUpdate();

        // Expect the label and comment to be returned, along with the type
        expect(context.result.properties.map(p => p.key)).toEqual(
            expect.arrayContaining([LABEL_URI, COMMENT_URI, '@type'])
        );
    });

    it.skip('should return type info from linked data', async () => {
        const context = {
            fetchLinkedDataForSubject: () => Promise.resolve(defaultJsonLd),
            shapes: [{[SHACL_TARGET_CLASS]: [{'@id': 'http://type'}]}]
        };

        const {result, waitForNextUpdate} = renderHook(() =>
            useLinkedDataNoContext('http://subject', context)
        );

        await waitForNextUpdate();

        expect(result.current.typeInfo.typeIri).toEqual('http://type');
    });
});
