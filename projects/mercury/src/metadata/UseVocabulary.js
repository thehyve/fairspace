import {useState, useCallback} from 'react';

import {vocabularyUtils} from "../common/utils/linkeddata/vocabularyUtils";
import {VocabularyAPI} from './LinkedDataAPI';

// TODO: This should be in a context to avoid refetching more than required
const UseVocabulary = () => {
    const [vocabulary, setVocabulary] = useState(vocabularyUtils([]));
    const [vocabularyLoading, setVocabularyLoading] = useState(false);
    const [vocabularyError, setVocabularyError] = useState(false);

    const fetchVocabulary = useCallback(() => {
        setVocabularyLoading(true);
        return VocabularyAPI.get()
            .then(data => {
                setVocabulary(vocabularyUtils(data));
                setVocabularyLoading(false);
                setVocabularyError(false);
            })
            .catch(() => {
                setVocabularyError('An error occurred while loading the vocbulary');
            });
    }, []);

    return {
        vocabulary,
        vocabularyLoading,
        vocabularyError,
        fetchVocabulary,
    };
};

export default UseVocabulary;
