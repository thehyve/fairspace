import vocabularyJsonLd from '../../services/test.vocabulary.json';
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "./vocabularyReducers";

describe('retrieving vocabulary from state', () => {
    it('loads the vocabulary from state', () => {
        const state = {
            cache: {
                vocabulary: {
                    data: vocabularyJsonLd
                }
            }
        };
        expect(getVocabulary(state).vocabulary).toEqual(vocabularyJsonLd);
    });

    it('does not fail on missing vocabulary', () => {
        const state = {
            cache: {
            }
        };

        expect(getVocabulary(state).vocabulary).toEqual([]);
    });
});

describe('isVocabularyPending', () => {
    it('returns true while loading metadata', () => expect(isVocabularyPending({cache: {vocabulary: {pending: true}}})).toBeTruthy());
    it('returns false on metadata error', () => expect(isVocabularyPending({cache: {vocabulary: {error: true}}})).toBeFalsy());
    it('returns false with missing data for subject', () => expect(isVocabularyPending({cache: {vocabulary: {}}})).toBeFalsy());
    it('returns false with empty metadata', () => expect(isVocabularyPending({cache: {vocabulary: {data: []}}})).toBeFalsy());
});

describe('hasVocabularyError', () => {
    it('returns false while loading metadata', () => expect(hasVocabularyError({cache: {vocabulary: {pending: true}}})).toBeFalsy());
    it('returns true on metadata error', () => expect(hasVocabularyError({cache: {vocabulary: {error: true}}})).toBeTruthy());
    it('returns false with missing data for subject', () => expect(hasVocabularyError({cache: {vocabulary: {}}})).toBeFalsy());
    it('returns false with empty metadata', () => expect(hasVocabularyError({cache: {vocabulary: {data: []}}})).toBeFalsy());
});
