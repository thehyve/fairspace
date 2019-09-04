import {getMetadataForSubject, hasMetadataError, isMetadataPending} from "../jsonLdBySubjectReducers";

describe('retrieving metadata from state', () => {
    const subject = 'http://subject';

    it('returns metadata in cache if present', () => expect(getMetadataForSubject({cache: {jsonLdBySubject: {[subject]: {data: 'my-data'}}}}, subject)).toEqual('my-data'));
    it('returns nothing while loading metadata', () => expect(getMetadataForSubject({cache: {jsonLdBySubject: {[subject]: {pending: true}}}}, subject)).toEqual([]));
    it('returns nothing on metadata error', () => expect(getMetadataForSubject({cache: {jsonLdBySubject: {[subject]: {error: true}}}}, subject)).toEqual([]));
    it('returns nothing with unknown subject', () => expect(getMetadataForSubject({cache: {jsonLdBySubject: {other: {pending: false}}}}, subject)).toEqual([]));
    it('returns nothing when no metadata is stored at all', () => expect(getMetadataForSubject({cache: {}}, subject)).toEqual([]));
    it('returns nothing with missing data for subject', () => expect(getMetadataForSubject({cache: {jsonLdBySubject: {[subject]: {}}}}, subject)).toEqual([]));
});

describe('isMetadataPending', () => {
    const subject = 'http://subject';
    it('returns true while loading metadata', () => expect(isMetadataPending({cache: {jsonLdBySubject: {[subject]: {pending: true}}}}, subject)).toBeTruthy());
    it('returns false on metadata error', () => expect(isMetadataPending({cache: {jsonLdBySubject: {[subject]: {error: true}}}}, subject)).toBeFalsy());
    it('returns false with unknown subject', () => expect(isMetadataPending({cache: {jsonLdBySubject: {other: {pending: false}}}}, subject)).toBeFalsy());
    it('returns false when metadata is stored at all', () => expect(isMetadataPending({cache: {}}, subject)).toBeFalsy());
    it('returns false with missing data for subject', () => expect(isMetadataPending({cache: {jsonLdBySubject: {[subject]: {}}}}, subject)).toBeFalsy());
    it('returns false with empty metadata', () => expect(isMetadataPending({cache: {jsonLdBySubject: {[subject]: {data: []}}}}, subject)).toBeFalsy());
});

describe('hasMetadataError', () => {
    const subject = 'http://subject';
    it('returns false while loading metadata', () => expect(hasMetadataError({cache: {jsonLdBySubject: {[subject]: {pending: true}}}}, subject)).toBeFalsy());
    it('returns true on metadata error', () => expect(hasMetadataError({cache: {jsonLdBySubject: {[subject]: {error: true}}}}, subject)).toBeTruthy());
    it('returns false with unknown subject', () => expect(hasMetadataError({cache: {jsonLdBySubject: {other: {pending: false}}}}, subject)).toBeFalsy());
    it('returns false when metadata is stored at all', () => expect(hasMetadataError({cache: {}}, subject)).toBeFalsy());
    it('returns false with missing data for subject', () => expect(hasMetadataError({cache: {jsonLdBySubject: {[subject]: {}}}}, subject)).toBeFalsy());
    it('returns false with empty metadata', () => expect(hasMetadataError({cache: {jsonLdBySubject: {[subject]: {data: []}}}}, subject)).toBeFalsy());
});
