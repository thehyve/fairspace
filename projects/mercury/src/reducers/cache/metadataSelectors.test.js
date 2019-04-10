import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "./jsonLdBySubjectReducers";
import vocabularyJsonLd from '../../services/test.vocabulary.json';

describe('retrieving metadata from state', () => {
    const subject = 'http://subject';

    it('combines metadata with the vocabulary', () => {
        const state = {
            cache: {
                vocabulary: {
                    data: vocabularyJsonLd
                },
                jsonLdBySubject: {
                    [subject]: {
                        data: [{
                            '@id': subject,
                            '@type': ['http://fairspace.io/ontology#Collection']
                        }]
                    }
                }
            }
        };

        expect(getCombinedMetadataForSubject(state, subject).length).toEqual(6);
    });

    it('does not fail on missing vocabulary', () => {
        const state = {
            cache: {
                jsonLdBySubject: {
                    [subject]: {
                        data: [{
                            '@id': subject,
                            '@type': ['http://fairspace.io/ontology#Collection']
                        }]
                    }
                }
            }
        };

        // Without a vocabulary, only the type information should be returned
        const metadata = getCombinedMetadataForSubject(state, subject);
        expect(metadata.length).toEqual(1);
        expect(metadata[0].key).toEqual('@type');
    });

    it('does not fail on missing metadata', () => {
        const state = {
            cache: {
                vocabulary: {
                    data: vocabularyJsonLd
                }
            }
        };

        expect(getCombinedMetadataForSubject(state, subject).length).toEqual(0);
    });
});

describe('isMetadataPending', () => {
    const subject = 'http://subject';
    it('returns true while loading metadata', () => expect(isMetadataPending({cache: {jsonLdBySubject: {[subject]: {pending: true}}}}, subject)).toBeTruthy());
    it('returns false on metadata error', () => expect(isMetadataPending({cache: {jsonLdBySubject: {[subject]: {error: true}}}}, subject)).toBeFalsy());
    it('returns true with unknown subject', () => expect(isMetadataPending({cache: {jsonLdBySubject: {other: {pending: false}}}}, subject)).toBeTruthy());
    it('returns true when metadata is stored at all', () => expect(isMetadataPending({cache: {}}, subject)).toBeTruthy());
    it('returns false with missing data for subject', () => expect(isMetadataPending({cache: {jsonLdBySubject: {[subject]: {}}}}, subject)).toBeFalsy());
    it('returns false with empty metadata', () => expect(isMetadataPending({cache: {jsonLdBySubject: {[subject]: {data: []}}}}, subject)).toBeFalsy());
});

describe('hasMetadataError', () => {
    const subject = 'http://subject';
    it('returns false while loading metadata', () => expect(hasMetadataError({cache: {jsonLdBySubject: {[subject]: {pending: true}}}}, subject)).toBeFalsy());
    it('returns true on metadata error', () => expect(hasMetadataError({cache: {jsonLdBySubject: {[subject]: {error: true}}}}, subject)).toBeTruthy());
    it('returns true with unknown subject', () => expect(hasMetadataError({cache: {jsonLdBySubject: {other: {pending: false}}}}, subject)).toBeTruthy());
    it('returns true when metadata is stored at all', () => expect(hasMetadataError({cache: {}}, subject)).toBeTruthy());
    it('returns false with missing data for subject', () => expect(hasMetadataError({cache: {jsonLdBySubject: {[subject]: {}}}}, subject)).toBeFalsy());
    it('returns false with empty metadata', () => expect(hasMetadataError({cache: {jsonLdBySubject: {[subject]: {data: []}}}}, subject)).toBeFalsy());
});
