import { useContext } from 'react';
import { getNamespacedIri } from '../../metadata/common/metadataUtils';
import VocabularyContext from '../../metadata/vocabulary/VocabularyContext';
import { getNamespaces } from '../../metadata/common/vocabularyUtils';

export default (iri) => {
    const { vocabulary } = useContext(VocabularyContext);

    return !!iri && getNamespacedIri(iri, getNamespaces(vocabulary));
};
