import {act} from 'react-dom/test-utils';
import {testHook} from "../../../utils/testUtils";
import {useLinkedData} from "../UseLinkedData";
import {
    COLLECTION_URI, COMMENT_URI, LABEL_URI, SHACL_PATH, SHACL_PROPERTY, SHACL_TARGET_CLASS
} from "../../../constants";
import {vocabularyUtils} from "../../../utils/linkeddata/vocabularyUtils";

const testUseLinkedData = (subject, context) => {
    let linkedData;

    testHook(() => {
        linkedData = useLinkedData(subject, context);
    });

    return linkedData;
};

describe('useLinkedData', () => {
    const defaultJsonLd = [{
        '@id': 'http://subject',
        '@type': ['http://type'],
        'http://prop1': [{'@value': 'v'}]
    }];

    it('should fetch linked data when first loaded', () => {
        const context = {
            fetchLinkedDataForSubject: jest.fn(x => x)
        };

        act(() => {
            testUseLinkedData('my-subject', context);
        });

        expect(context.fetchLinkedDataForSubject.mock.calls.length).toEqual(1);
    });

    it('should handle missing linkedData', () => {
        let linkedData;
        act(() => {
            linkedData = testUseLinkedData('my-subject');
        });

        expect(linkedData.properties).toEqual([]);
        expect(linkedData.values).toEqual({});
        expect(linkedData.typeInfo).toEqual({});
    });

    describe('loading state', () => {
        it('should not be loading by default', () => {
            let linkedData;

            act(() => {
                linkedData = testUseLinkedData('my-subject');
            });

            expect(linkedData.linkedDataLoading).toBe(false);
        });

        it('should be loading if shapes are loading', () => {
            const context = {shapesLoading: true};
            let linkedData;

            act(() => {
                linkedData = testUseLinkedData('my-subject', context);
            });

            expect(linkedData.linkedDataLoading).toBe(true);
        });

        it('should be loading if linked data is loading', () => {
            const context = {isLinkedDataLoading: () => true};
            let linkedData;

            act(() => {
                linkedData = testUseLinkedData('my-subject', context);
            });

            expect(linkedData.linkedDataLoading).toBe(true);
        });
    });

    describe('error state', () => {
        it('should not be in error state by default', () => {
            let linkedData;

            act(() => {
                linkedData = testUseLinkedData('my-subject');
            });

            expect(linkedData.linkedDataError).toBeTruthy();
        });

        it('should be in error state if shapes are in error state', () => {
            const context = {shapesError: true};
            let linkedData;

            act(() => {
                linkedData = testUseLinkedData('my-subject', context);
            });

            expect(linkedData.linkedDataError).toBeTruthy();
        });

        it('should be in error state if linked data is in error state', () => {
            const context = {hasLinkedDataErrorForSubject: () => true};
            let linkedData;

            act(() => {
                linkedData = testUseLinkedData('my-subject', context);
            });

            expect(linkedData.linkedDataError).toBeTruthy();
        });
    });

    it('should extract values from linked data', () => {
        const context = {
            getLinkedDataForSubject: () => defaultJsonLd,
            shapes: {
                determinePropertyShapesForTypes: () => [{
                    [SHACL_PATH]: [{'@id': 'http://prop1'}]
                }],
                getProperties: () => []
            }
        };

        let linkedData;
        act(() => {
            linkedData = testUseLinkedData('http://subject', context);
        });

        expect(linkedData.values['http://prop1'][0].value).toEqual('v');
    });

    it('should return properties based on the type of the entity', () => {
        const context = {
            getLinkedDataForSubject: () => ([{
                ...defaultJsonLd[0],
                '@type': ['http://specific-type']
            }]),
            shapes: vocabularyUtils([
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

            ])
        };

        let linkedData;
        act(() => {
            linkedData = testUseLinkedData('http://subject', context);
        });

        // Expect the label and comment to be returned, along with the type
        expect(linkedData.properties.map(p => p.key)).toEqual(expect.arrayContaining([LABEL_URI, COMMENT_URI, '@type']));
    });

    it('should return type info from linked data', () => {
        const context = {
            getLinkedDataForSubject: () => defaultJsonLd,
            getTypeInfoForLinkedData: jest.fn(() => 'type-info'),
            shapes: {
                determinePropertyShapesForTypes: () => [],
                getProperties: () => []
            },
        };

        let linkedData;
        act(() => {
            linkedData = testUseLinkedData('http://subject', context);
        });

        expect(linkedData.typeInfo).toEqual('type-info');
        expect(context.getTypeInfoForLinkedData.mock.calls[0][0]['@id']).toEqual('http://subject');
    });
});
