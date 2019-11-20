import {useState, useCallback} from 'react';

import {MetaVocabularyAPI} from './LinkedDataAPI';

// TODO: This should be in a context to avoid refetching more than required
const UseMetaVocabulary = () => {
    const [metaVocabulary, setMetaVocabulary] = useState([]);
    const [shapesLoading, setShapesLoading] = useState(false);
    const [shapesError, setShapesError] = useState(false);

    const fetchMetaVocabulary = useCallback(() => {
        setShapesLoading(true);
        MetaVocabularyAPI.get()
            .then(data => {
                setMetaVocabulary(data);
                setShapesLoading(false);
                setShapesError(false);
            })
            .catch(() => {
                setShapesError('An error occurred while loading the meta vocbulary');
            });
    }, []);

    return {
        metaVocabulary,
        shapesLoading,
        shapesError,
        fetchMetaVocabulary,
    };
};

export default UseMetaVocabulary;
