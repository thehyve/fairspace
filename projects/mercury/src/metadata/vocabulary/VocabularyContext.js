import React, {useContext} from 'react';

import {LinkedDataVocabularyAPI} from '../common/VocabularyAPI';
import useAsync from '../../common/hooks/UseAsync';
import MetadataAPIPathContext from '../common/MetadataAPIPathContext';

const VocabularyContext = React.createContext();

export const VocabularyProvider = ({children}) => {
    const {path: metadataAPIPath} = useContext(MetadataAPIPathContext);
    const {
        data: vocabulary = [],
        loading: vocabularyLoading,
        error: vocabularyError
    } = useAsync(() => new LinkedDataVocabularyAPI(metadataAPIPath).get());

    return (
        <VocabularyContext.Provider
            value={{
                vocabulary,
                vocabularyLoading,
                vocabularyError
            }}
        >
            {children}
        </VocabularyContext.Provider>
    );
};

export default VocabularyContext;
