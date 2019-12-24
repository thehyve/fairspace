import {renderHook} from "@testing-library/react-hooks";
import {useLinkedDataNoContext} from '../UseLinkedData';
import {COLLECTION_URI, COMMENT_URI, LABEL_URI, SHACL_PATH, SHACL_PROPERTY, SHACL_TARGET_CLASS} from '../../constants';

describe('useLinkedData', () => {
    const defaultJsonLd = [{
        '@id': 'http://subject',
        '@type': ['http://type'],
        'http://prop1': [{'@value': 'v'}]
    }];

    const defaultContext = {
        fetchLinkedDataForSubject: () => Promise.resolve([])
    };

    it('should fetch linked data when first loaded', async () => {
        const context = {
            fetchLinkedDataForSubject: jest.fn(() => Promise.resolve([])),
            shapes: [{aShapeKey: 'aValue'}]
        };

        const {waitForNextUpdate} = renderHook(() => useLinkedDataNoContext('http://subject', context));

        await waitForNextUpdate();

        expect(context.fetchLinkedDataForSubject).toHaveBeenCalledTimes(1);
    });

    it('should handle missing linkedData', async () => {
        const {result} = renderHook(() => useLinkedDataNoContext('my-subject', defaultContext));

        expect(result.current.properties).toEqual([]);
        expect(result.current.values).toEqual({});
        expect(result.current.typeInfo).toEqual({});
    });

    describe('loading state', () => {
        it('should not be loading by default', async () => {
            const {result} = renderHook(() => useLinkedDataNoContext('my-subject', defaultContext));

            expect(result.current.linkedDataLoading).toBe(false);
        });

        it('should be loading if shapes are loading', async () => {
            const {result} = renderHook(() => useLinkedDataNoContext('my-subject', {...defaultContext, shapesLoading: true}));

            expect(result.current.linkedDataLoading).toBe(true);
        });
    });

    describe('error state', () => {
        it('should show some message for no metadata', async () => {
            const {result} = renderHook(() => useLinkedDataNoContext('my-subject', defaultContext));

            expect(result.current.linkedDataError).toMatch(/no metadata found/i);
        });

        it('should be in error state if shapes are in error state', async () => {
            const {result} = renderHook(() => useLinkedDataNoContext('my-subject', {...defaultContext, shapesError: true}));

            expect(result.current.linkedDataError).toBeTruthy();
        });
    });

    it('should return properties based on the type of the entity', async () => {
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
            fetchLinkedDataForSubject: () => Promise.resolve([{
                ...defaultJsonLd[0],
                '@type': ['http://specific-type']
            }])
        };

        const {result, waitForNextUpdate} = renderHook(() => useLinkedDataNoContext('http://subject', context));

        await waitForNextUpdate();

        // Expect the label and comment to be returned, along with the type
        expect(result.current.properties.map(p => p.key)).toEqual(expect.arrayContaining([LABEL_URI, COMMENT_URI, '@type']));
    });

    it('should return type info from linked data', async () => {
        const context = {
            fetchLinkedDataForSubject: () => Promise.resolve(defaultJsonLd),
            shapes: [{[SHACL_TARGET_CLASS]: [{"@id": "http://type"}]}]
        };

        const {result, waitForNextUpdate} = renderHook(() => useLinkedDataNoContext('http://subject', context));

        await waitForNextUpdate();

        expect(result.current.typeInfo.typeIri).toEqual('http://type');
    });
});
