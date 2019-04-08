import vocabularyJsonLd from '../services/test.vocabulary.json';
import {getMetaVocabulary, hasMetaVocabularyError, isMetaVocabularyPending} from "./metaVocabularySelectors";

describe('retrieving meta vocabulary from state', () => {
    it('loads the meta vocabulary from state', () => {
        const state = {
            cache: {
                metaVocabulary: {
                    data: vocabularyJsonLd
                }
            }
        };
        expect(getMetaVocabulary(state).vocabulary).toEqual(vocabularyJsonLd);
    });

    it('does not fail on missing meta vocabulary', () => {
        const state = {
            cache: {
            }
        };

        expect(getMetaVocabulary(state).vocabulary).toEqual([]);
    });
});

describe('isMetaVocabularyPending', () => {
    it('returns true while loading meta vocabulary', () => expect(isMetaVocabularyPending({cache: {metaVocabulary: {pending: true}}})).toBeTruthy());
    it('returns false on meta vocabulary error', () => expect(isMetaVocabularyPending({cache: {metaVocabulary: {error: true}}})).toBeFalsy());
    it('returns true when no meta vocabulary is stored at all', () => expect(isMetaVocabularyPending({cache: {}})).toBeTruthy());
    it('returns false with empty object for meta vocabulary', () => expect(isMetaVocabularyPending({cache: {metaVocabulary: {}}})).toBeFalsy());
    it('returns false with empty meta vocabulary', () => expect(isMetaVocabularyPending({cache: {metaVocabulary: {data: []}}})).toBeFalsy());
});

describe('hasMetaVocabularyError', () => {
    it('returns false while loading meta vocabulary', () => expect(hasMetaVocabularyError({cache: {metaVocabulary: {pending: true}}})).toBeFalsy());
    it('returns true on meta vocabulary error', () => expect(hasMetaVocabularyError({cache: {metaVocabulary: {error: true}}})).toBeTruthy());
    it('returns true when no meta vocabulary is stored at all', () => expect(hasMetaVocabularyError({cache: {}})).toBeTruthy());
    it('returns false with empty object for meta vocabulary', () => expect(hasMetaVocabularyError({cache: {metaVocabulary: {}}})).toBeFalsy());
    it('returns false with empty meta vocabulary', () => expect(hasMetaVocabularyError({cache: {metaVocabulary: {data: []}}})).toBeFalsy());
});
