import {useContext} from 'react';
import {getNamespacedIri} from "../utils/linkeddata/metadataUtils";
import VocabularyContext from '../../metadata/VocabularyContext';

export default (iri) => {
    const {vocabulary} = useContext(VocabularyContext);

    return !!iri && getNamespacedIri(iri, vocabulary.getNamespaces());
};
